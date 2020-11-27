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
import validateDist from '../Utils/validaDistanciaMinima'

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
        subtitle: ['Informe os dados do veículo.', 'Preencha os campos abaixo conforme a vistoria realizada'],
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
            { equipamentos, acessibilidade } = redux,
            demand = this.props?.location?.state?.demand

        if (demand) {
            const demandState = setDemand(demand, redux)
            console.log(demandState)
            this.setState({ ...demandState, activeStep: 3 })
        }

        //*********Create state[key] for each equipamentos/acessibilidade and turn them to false before a vehicle is selected *********/
        //Se tiver demanda, os equipamentos e acessibilidade são definidos no dataActions para incorporar no estado global
        let
            allEqs = {},
            allAcs = {}

        equipamentos.forEach(e => Object.assign(allEqs, { [e?.item]: false }))
        acessibilidade.forEach(e => Object.assign(allAcs, { [e?.item]: false }))

        await this.setState({ ...allEqs, ...allAcs })
        //await this.setState({ ...allEqs, ...allAcs, selectedEmpresa: redux.empresas[0], razaoSocial: 'what' })

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
                    const { razaoSocial, codigoEmpresa } = selectedEmpresa
                    await this.setState({ selectedEmpresa, razaoSocial, codigoEmpresa })
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

    checkValid = async (name, value, collection, stateId, dbName, dbId, alertLabel) => {

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
            { empresas, modelosChassi, carrocerias, parametros } = this.props.redux,
            { distanciaPoltronas, idadeBaixa } = parametros[0],
            { idadeMaxCad, difIdade } = idadeBaixa,
            { frota, anoCarroceria, anoChassi, utilizacao, distanciaMinima } = this.state,
            { name } = e.target,
            carr = Number(anoCarroceria),
            chas = Number(anoChassi),
            currentYear = new Date().getFullYear(),
            maxAge = currentYear - idadeMaxCad

        let
            { value } = e.target,
            customTitle, customMsg

        const errors = checkInputErrors()
        if (errors) this.setState({ errors })
        else this.setState({ errors: undefined })

        switch (name) {
            case 'modeloChassi':
                this.checkValid(name, value, modelosChassi, 'modeloChassiId', 'modeloChassi', 'id', 'chassi')
                break
            case 'modeloCarroceria':
                this.checkValid(name, value, carrocerias, 'modeloCarroceriaId', 'modelo', 'id', 'carroceria')
                break
            case 'delegatarioCompartilhado':
                this.checkValid(name, value, empresas, 'compartilhadoId', 'razaoSocial', 'codigoEmpresa')
                break
            case 'anoChassi':
                customTitle = 'Ano de chassi inválido.'
                if (chas && chas < maxAge - 1)
                    customMsg = `O ano de fabricação do chassi informado é anterior à idade máxima permitida - ${idadeMaxCad} anos.`
                if ((carr && chas && (carr < chas || carr > chas + difIdade)))
                    customMsg = 'O ano de chassi é incompatível com o ano da carroceria informado.'

                if (customMsg) {
                    this.setState({ anoChassi: '', openAlertDialog: true, customTitle, customMsg })
                }
                break
            case 'anoCarroceria':
                customTitle = 'Ano de carroceria inválido.'
                if (carr && carr < maxAge)
                    customMsg = `O ano de fabricação do carroceria informado é anterior à idade máxima permitida - ${idadeMaxCad} anos.`
                if ((carr && chas && (carr < chas || carr > chas + difIdade)))
                    customMsg = 'O ano de fabricação carroceria é incompatível com o ano do chassi informado.'

                if (customMsg) {
                    this.setState({ anoCarroceria: '', openAlertDialog: true, customTitle, customMsg })
                }
                break
            case 'distanciaMinima':
                let errorMsg
                if (utilizacao)
                    errorMsg = validateDist(utilizacao, distanciaMinima, distanciaPoltronas)
                if (errorMsg)
                    this.setState({
                        openAlertDialog: true,
                        customTitle: 'Distância mínima inválida.',
                        customMsg: errorMsg,
                        distanciaMinima: ''
                    })
                break
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

    handleEquipa = async type => {

        const collection = this.props.redux[type]
        let
            vEquip = [],
            currentEquipa = []

        await this.setState({ type })

        //Só precisa pegar a lista e marcar check na hora de abrir o dialog.
        if (this.state.addEquipa === false) {
            if (this.state[type])
                currentEquipa = this.state[type]

            collection.forEach(({ item }) => {
                currentEquipa.forEach(eq => {
                    if (eq.toLowerCase() === item.toLowerCase())
                        vEquip.push(item)
                })
            })
            vEquip.forEach(ve => this.setState({ [ve]: true }))
        }
        this.setState({ addEquipa: !this.state.addEquipa })
    }

    handleCheck = async item => {
        const
            { type } = this.state,
            collection = this.props.redux[type]

        if (!collection) return

        let arrayOfEquips = [], ids = [], stateKey

        if (type === 'equipamentos') stateKey = 'equipamentosId'
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

    handleCadastro = async approved => {
        const
            { equipamentosId, acessibilidadeId, pesoDianteiro, pesoTraseiro, poltronas, codigoEmpresa, compartilhadoId, modeloChassiId, originalVehicle, getUpdatedValues,
                modeloCarroceriaId, selectedEmpresa, showPendencias, info, form, demand, demandFiles } = this.state,

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
            codigoEmpresa, situacao, pbt, modeloChassiId, modeloCarroceriaId,
            equipamentosId, acessibilidadeId, apolice: 'Seguro não cadastrado'
        })
        vReview.compartilhadoId = compartilhadoId

        if (demand && originalVehicle)
            vReview = getUpdatedValues(originalVehicle, vReview)     //Save only real changes to the request Object (method from setDemand())

        const vehicle = humps.decamelizeKeys(vReview)

        //***************If it doesnt exist, post the new vehicle Object, else get existing Id and update *********** */

        if (!existingVeiculoId)
            await axios.post('/api/cadastroVeiculo', vehicle)
                .then(res => {
                    veiculoId = res.data
                })
                .catch(err => console.log(err))
        else {
            veiculoId = existingVeiculoId

            if (demand && approved && !showPendencias)
                situacao = 'Seguro não cadastrado'

            const
                table = 'veiculos',
                tablePK = 'veiculo_id',
                requestObject = {
                    ...vehicle,
                    situacao
                }

            await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: veiculoId })
        }

        //*****************Generate log ************** */
        const log = {
            empresaId: selectedEmpresa?.codigoEmpresa,
            veiculoId,
            history: {
                info,
                files: form,
            },
            metadata: { veiculoId },
            demandFiles,
            historyLength: oldHistoryLength,
            approved
        }

        if (demand) log.id = demand?.id

        logGenerator(log)
            .then(r => console.log(r?.data))
            .catch(err => console.log(err))

        //*************Confirm send and clear State******************* */
        if (!approved) {
            let toastMsg = 'Solicitação de cadastro enviada.'
            if (demand && demand.status.match('Aguardando'))
                toastMsg = 'Pendências para o cadastro registradas.'
            this.toast(toastMsg)
        }
        else
            this.toast()

        if (!demand)
            this.resetState()
        else
            setTimeout(() => { this.props.history.push('/solicitacoes') }, 1500)
    }

    handleFiles = async (files, name) => {

        if (files && files[0]) {
            await this.setState({ [name]: files[0] })

            const newState = handleFiles(files, this.state, cadVehicleFiles)
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
            form: new FormData(),
            resetShared: true
        })
    }

    closeEquipa = () => this.setState({ addEquipa: false })
    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = toastMsg => this.setState({ confirmToast: !this.state.confirmToast, toastMsg: toastMsg ? toastMsg : this.state.toastMsg })

    render() {
        const
            { confirmToast, toastMsg, activeStep, openAlertDialog, alertType, steps, selectedEmpresa,
                dropDisplay, form, demand, demandFiles, showPendencias, info, resetShared, customMsg, customTitle } = this.state,

            { redux } = this.props

        return <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Cadastro de veículo' demand={demand} selectedEmpresa={selectedEmpresa} />

            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                setActiveStep={this.setActiveStep}
            />
            <CadVeiculoTemplate
                data={this.state}
                redux={redux}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleEquipa={this.handleEquipa}
                handleCheck={this.handleCheck}
                closeEquipa={this.closeEquipa}
                match={this.props.match}
                resetShared={resetShared}
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
            //disabled={(typeof placa !== 'string' || placa === '')}
            />}
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.toggleDialog} alertType={alertType} customMessage={customMsg} customTitle={customTitle} />}
        </Fragment>
    }
}
const collections = ['veiculos', 'empresas', 'modelosChassi', 'carrocerias', 'equipamentos', 'acessibilidade', 'getFiles/vehicleDocs', 'parametros']

export default StoreHOC(collections, VeiculosContainer)