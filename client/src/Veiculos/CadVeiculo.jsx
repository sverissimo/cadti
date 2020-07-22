import React, { PureComponent, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import { setDemand } from '../Utils/setDemand'
import { handleFiles, removeFile } from '../Utils/handleFiles'
import { checkInputErrors } from '../Utils/checkInputErrors'
import { logGenerator } from '../Utils/logGenerator'

import CadVeiculoTemplate from './CadVeiculoTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './VehicleReview'

import Crumbs from '../Reusable Components/Crumbs'
import StepperButtons from '../Reusable Components/StepperButtons'
import CustomStepper from '../Reusable Components/Stepper'
import ReactToast from '../Reusable Components/ReactToast'

import { formatMoney } from '../Utils/formatValues'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { cadVehicleForm } from '../Forms/cadVehicleForm'

import AlertDialog from '../Reusable Components/AlertDialog'

class VeiculosContainer extends PureComponent {
    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27 && this.state.addEquipa)
                this.closeEquipa()
        }
    }

    state = {
        activeStep: 0,
        steps: ['Dados do Veículo', 'Vistoria e laudos', 'Documentos', 'Revisão'],
        subtitle: ['Informe os dados do Veículo', 'Preencha os campos abaixo conforme a vistoria realizada'],
        razaoSocial: '',
        frota: [],
        delegatarioCompartilhado: '',
        toastMsg: 'Veículo cadastrado!',
        confirmToast: false,
        addEquipa: false,
        openAlertDialog: false,
        dropDisplay: 'Clique ou arraste para anexar'
    }

    async componentDidMount() {

        const
            { redux } = this.props,
            { modelosChassi, carrocerias, seguradoras, equipamentos, acessibilidade } = redux,
            demand = this.props?.location?.state?.demand

        if (demand) {
            const demandState = setDemand(demand, redux)            
            this.setState({ ...demandState, activeStep: 3 })
        }

        //*********Create state[key] for each equipamentos/acessibilidade and turn them to false before a vehicle is selected *********/
        let
            allEqs = {},
            allAcs = {}

        equipamentos.forEach(e => Object.assign(allEqs, { [e?.item]: false }))
        acessibilidade.forEach(e => Object.assign(allAcs, { [e?.item]: false }))

        await this.setState({
            ...allEqs, ...allAcs, modelosChassi, carrocerias, seguradoras, allInsurances: this.props.redux['seguros']
        })

        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() { 
        this.setState({}) 
        document.removeEventListener('keydown', this.escFunction, false)
    }

    setActiveStep = async action => {

        if (this.state.activeStep === 0) {
            const matchPlaca = this.state.frota.filter(v => v.placa === this.state.placa)[0]
            if (matchPlaca) {
                await this.setState({ placa: '' });
                this.setState({ alertType: 'plateExists', openAlertDialog: true })
                return null
            }
        }

        const { errors } = this.state
        if (errors && errors[0]) {
            await this.setState({ ...this.state, ...checkInputErrors('setState') })
            return
        }

        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })
    }

    handleInput = async e => {
        const
            { veiculos, empresas } = this.props.redux,
            { name } = e.target
        let
            { value } = e.target
        
        this.setState({ [name]: value })

        switch (name) {
            case 'razaoSocial':

                let selectedEmpresa = empresas.find(e => e.razaoSocial === value)

                if (selectedEmpresa) {
                    const { razaoSocial, delegatarioId } = selectedEmpresa
                    await this.setState({ selectedEmpresa, razaoSocial, delegatarioId })
                    if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                    const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)

                    this.setState({ frota })

                } else this.setState({ selectedEmpresa: undefined, frota: [], placa: undefined })
                break

            case 'placa':
                if (typeof value === 'string') {
                    value = value.toLocaleUpperCase()
                    await this.setState({ [name]: value })
                }
                break

            case ('valorChassi'):
                this.setState({ [name]: formatMoney(value) })
                break
            case ('valorCarroceria'):
                this.setState({ [name]: formatMoney(value) })
                break

            default: void 0
        }
    }

    getId = async (name, value, collection, stateId, dbName, dbId, alertLabel) => {

        const item = collection.filter(el => el[dbName].toLowerCase().match(value.toLowerCase()))
        if (value === '') this.setState({ [name]: '', [stateId]: '' })
        if (item[0]) {
            const nombre = item[0][dbName]
            const id = item[0][dbId]
            if (value !== '') {
                await this.setState({ [name]: nombre, [stateId]: id })

            }
        } else {
            await this.setState({ [name]: '', [stateId]: '' })
            this.setState({
                alertType: 'invalidModel', openAlertDialog: true,
                customMsg: `O modelo de ${alertLabel} não está cadastrado no sistema.`
            })
            document.getElementsByName(name)[0].focus()
        }
    }

    handleBlur = async e => {
        const
            { empresas } = this.props.redux,
            { frota, modelosChassi, carrocerias } = this.state,
            { name } = e.target
        let
            { value } = e.target

        const errors = checkInputErrors()
        if (errors) this.setState({ errors })
        else this.setState({ errors: undefined })

        switch (name) {
            case 'modeloChassi':
                this.getId(name, value, modelosChassi, 'modeloChassiId', 'modeloChassi', 'id', 'chassi')
                break;
            case 'modeloCarroceria':
                this.getId(name, value, carrocerias, 'modeloCarroceriaId', 'modelo', 'id', 'carroceria')
                break;
            case 'delegatarioCompartilhado':
                this.getId(name, value, empresas, 'compartilhadoId', 'razaoSocial', 'delegatarioId')
                break;
            default: void 0
        }

        if (name === 'placa' && typeof this.state.frota !== 'string') {

            if (value.length === 7) {
                const x = value.replace(/(\w{3})/, '$1-')
                await this.setState({ placa: x })
                value = x
            }
            if (value.length === 8) {
                const x = value.replace(' ', '-')
                await this.setState({ placa: x })
                value = x
            }
            const matchPlaca = frota.find(v => v.placa === value)
            if (matchPlaca) {
                await this.setState({ placa: null });
                value = ''
                this.setState({ alertType: 'plateExists', openAlertDialog: true })
                document.getElementsByName('placa')[0].focus()
            }
        }
    }

    handleEquipa = type => {
        const collection = this.props.redux[type]
        let vEquip = [], currentEquipa = []

        if (this.state[type]) currentEquipa = this.state[type]


        collection.forEach(({ item }) => {
            currentEquipa.forEach(ce => {
                if (ce.toLowerCase() === item.toLowerCase()) vEquip.push(item)
            })
        })

        vEquip.forEach(ve => this.setState({ [ve]: true }))

        this.setState({ [collection]: vEquip, addEquipa: !this.state.addEquipa, type })
    }
    
    handleCheck = async item => {
        const
            { type } = this.state,
            collection = this.props.redux[type]

        if (!collection) return

        let arrayOfEquips = [], ids = [], stateKey

        if (type === 'equipamentos') stateKey = 'equipa'
        if (type === 'acessibilidade') stateKey = 'acessibilidadeId'

        await this.setState({ ...this.state, [item]: !this.state[item] })

        collection.forEach(({ id, item }) => {
            if (this.state[item] === true) {
                arrayOfEquips.push(item)
                ids.push(id)
            }
        })

        if (arrayOfEquips[0]) this.setState({ [type]: arrayOfEquips, [stateKey]: ids })
        else if (type === 'equipamentos') this.setState({ equipamentos: [], [stateKey]: [] })
        else if (type === 'acessibilidade') this.setState({ acessibilidade: [], [stateKey]: [] })
    }

    handleCadastro = async (approved) => {
        const
            { anoCarroceria, pesoDianteiro, pesoTraseiro, poltronas, delegatarioId, compartilhadoId, modeloChassiId, originalVehicle, getUpdatedValues,
                modeloCarroceriaId, selectedEmpresa, equipa, acessibilidadeId, showPendencias, info, form, demand, demandFiles } = this.state,

            indicadorIdade = anoCarroceria,

            existingVeiculoId = demand?.veiculoId,
            oldHistoryLength = demand?.history?.length || 0

        let
            veiculoId,
            situacao = 'Cadastro solicitado'

        let pbt = Number(poltronas) * 93 + (Number(pesoDianteiro) + Number(pesoTraseiro))
        if (isNaN(pbt)) pbt = undefined

        //**********Prepare the request Object************* */
        let review = {}

        cadVehicleForm.forEach(form => {
            form.forEach(obj => {
                for (let k in this.state) {
                    if (k === obj.field) Object.assign(review, { [k]: this.state[k] })
                }
            })
        })

        let { delegatarioCompartilhado, modeloChassi, modeloCarroceria, ...vReview } = review

        Object.assign(vReview, {
            delegatarioId, situacao, indicadorIdade, pbt, modeloChassiId, modeloCarroceriaId,
            equipa, acessibilidadeId, apolice: 'Seguro não cadastrado'
        })
        vReview.delegatarioCompartilhado = compartilhadoId

        if (demand && originalVehicle)
            vReview = getUpdatedValues(originalVehicle, vReview)     //Save only real changes to the request Object (method from setDemand())

        const vehicle = humps.decamelizeKeys(vReview)

        //***************If it doesnt exist, post the new vehicle Object, else get existing Id and update *********** */

        if (!existingVeiculoId)
            await axios.post('/api/cadastroVeiculo', vehicle)
                .then(res => {
                    veiculoId = res.data
                    console.log(veiculoId)
                })
                .catch(err => console.log(err))
        else {
            veiculoId = existingVeiculoId
            if (demand && approved && !showPendencias) situacao = 'Ativo'

            const
                table = 'veiculo',
                tablePK = 'veiculo_id',
                requestObject = {
                    ...vehicle,
                    situacao
                }

            await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: veiculoId })
        }

        //*****************Generate log ************** */
        let updatedIdFormData = new FormData()

        if (form instanceof FormData) {
            updatedIdFormData.set('veiculoId', veiculoId)
            for (let p of form) {
                updatedIdFormData.set(p[0], p[1])
            }
        } else updatedIdFormData = null

        let log = {
            empresaId: selectedEmpresa?.delegatarioId,
            veiculoId,
            history: {},
            files: updatedIdFormData,
            demandFiles,
            historyLength: oldHistoryLength
        }

        if (info) log.history = { info }
        if (demand) log.id = demand?.id
        if (approved) log.completed = true
        //        console.log(log, info)
        logGenerator(log)
            .then(r => console.log(r?.data))
            .catch(err => console.log(err))

        //*********************if approved, putRequest to update DB  ********************** */

        this.resetState()
        this.toast()
    }

    handleFiles = async (files, name) => {

        let formData = new FormData()

        if (files && files[0]) {
            await this.setState({ [name]: files[0] })

            const newState = handleFiles(files, formData, this.state, cadVehicleFiles)
            this.setState({ ...newState, fileToRemove: null })
        }
    }

    removeFile = async (name) => {        
        const
            { form } = this.state,
            newState = removeFile(name, form)

        this.setState({ ...this.state, ...newState })
    }

    resetState = () => {
        const
            resetState = {},
            { equipamentos } = this.props.redux,
            resetFiles = {},
            resetEquip = {}

        cadVehicleForm.forEach(form => {
            form.forEach(obj => {
                Object.keys(obj).forEach(key => {
                    if (key === 'field' && this.state[obj[key]]) Object.assign(resetState, { [obj[key]]: undefined })
                })
            })
        })
        cadVehicleFiles.forEach(({ name }) => {
            Object.assign(resetFiles, { [name]: null })
        })

        equipamentos.forEach(e => Object.assign(resetEquip, { [e.item]: false }))

        this.setState({
            ...resetState,
            ...resetFiles,
            ...resetEquip,
            activeStep: 0,
            razaoSocial: '',
            selectedEmpresa: undefined,
            frota: [],
            delegatarioCompartilhado: '',
            form: new FormData()
        })
    }
    
    closeEquipa = () => this.setState({ addEquipa: false })
    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const
            { confirmToast, toastMsg, activeStep, openAlertDialog, alertType, steps, selectedEmpresa,
                placa, dropDisplay, form, demand, demandFiles, showPendencias, info } = this.state,

            { empresas, equipamentos, acessibilidade } = this.props.redux

        return <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Cadastro de veículo' demand={demand} />

            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                setActiveStep={this.setActiveStep}
            />
            <CadVeiculoTemplate
                data={this.state}
                empresas={empresas}
                equipamentos={equipamentos}
                acessibilidade={acessibilidade}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleEquipa={this.handleEquipa}
                handleCheck={this.handleCheck}
                closeEquipa={this.closeEquipa}
                match={this.props.match}
            />
            {activeStep === 2 && <VehicleDocs
                parentComponent='cadastro'
                dropDisplay={dropDisplay}
                formData={form}
                handleFiles={this.handleFiles}
                demandFiles={demandFiles}                
                fileToRemove={this.state.fileToRemove}
                removeFile={this.removeFile}
            />}

            {activeStep === 3 && <Review
                parentComponent='cadastro' files={this.state.form}
                filesForm={cadVehicleFiles} data={this.state}
                form={cadVehicleForm}
            />}

            {selectedEmpresa && <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                setActiveStep={this.setActiveStep}
                demand={demand}
                setShowPendencias={this.setShowPendencias}
                showPendencias={showPendencias}
                info={info}
                handleSubmit={this.handleCadastro}
                handleInput={this.handleInput}
                disabled={(typeof placa !== 'string' || placa === '')}
            />}
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.toggleDialog} alertType={alertType} customMessage={this.state.customMsg} />}
        </Fragment>
    }
}
const collections = ['veiculos', 'empresas', 'modelosChassi', 'carrocerias', 'equipamentos', 'acessibilidade', 'getFiles/vehicleDocs']

export default StoreHOC(collections, VeiculosContainer)