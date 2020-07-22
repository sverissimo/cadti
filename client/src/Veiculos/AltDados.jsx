import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import { checkDemand } from '../Utils/checkDemand'
import { checkInputErrors } from '../Utils/checkInputErrors'
import ReactToast from '../Reusable Components/ReactToast'
import { altDadosFiles } from '../Forms/altDadosFiles'
import { altForm } from '../Forms/altForm'
import { logGenerator } from '../Utils/logGenerator'
import { setDemand } from '../Utils/setDemand'

import Crumbs from '../Reusable Components/Crumbs'
import CustomStepper from '../Reusable Components/Stepper'

import AltDadosTemplate from './AltDadosTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './VehicleReview'
import StepperButtons from '../Reusable Components/StepperButtons'

import FormDialog from '../Reusable Components/FormDialog'
import AlertDialog from '../Reusable Components/AlertDialog'
import { handleFiles, removeFile } from '../Utils/handleFiles'


class AltDados extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.addEquipa) this.closeEquipa()
            }
        }
    }

    state = {
        stepTitles: ['Informe a placa para alterar os dados abaixo ou mantenha as informações atuais e clique em avançar',
            'Altere os dados desejados abaixo e clique em avançar', 'Anexe os documentos solicitados',
            'Revisão das informações e deferimento'],
        steps: ['Alterar dados do Veículo', 'Alterar dados adicionais', 'Documentos', 'Revisão'],

        subtitle: ['Dados do Veículo', 'Informações adicionais',
            'Anexe os arquivos solicitados', 'Revisão'],
        empresas: [],
        razaoSocial: '',
        delegatarioCompartilhado: '',
        frota: [],
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        activeStep: 0,
        files: [],
        openAlertDialog: false,
        altPlaca: false,
        newPlate: '',
        placa: '',
        addEquipa: false,
        dropDisplay: 'Clique ou arraste para anexar',
        showPendencias: false
    }

    async componentDidMount() {
        const
            { redux } = this.props,
            { equipamentos, acessibilidade } = redux,
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

        await this.setState({ ...allEqs, ...allAcs })

        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() { this.setState({}) }

    setActiveStep = async action => {
        const { errors } = this.state
        if (errors && errors[0]) {
            this.setState({ ...this.state, ...checkInputErrors('setState') })
            return
        }

        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })
    }

    handleInput = async e => {
        const { veiculos, empresas, equipamentos } = this.props.redux,
            { name, value } = e.target

        if (name === 'razaoSocial') {
            let selectedEmpresa = empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)

                this.setState({ frota })

            } else {
                this.setState({ selectedEmpresa: undefined, frota: [] })
                this.reset()
            }
        }

        if (name === 'placa' && this.state.frota) {
            const vehicle = this.state.frota.find(v => v.placa === value)
            if (!vehicle) equipamentos.forEach(e => this.setState({ [e]: false }))
        }

        if (name === 'newPlate') {
            let newPlate = value
            if (typeof newPlate === 'string') {
                newPlate = newPlate.replace(/[a-z]/g, l => l.toUpperCase())
                if (newPlate.match('[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}')) newPlate = newPlate.replace(/(\w{3})/, '$1-')
                this.setState({ ...this.state, newPlate })
            }
        } else this.setState({ [name]: value })
    }

    getId = async (name, value, collection, stateId, dbName, dbId) => {

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
            this.setState({ openAlertDialog: true, alertType: 'empresaNotFound' })
            document.getElementsByName(name)[0].focus()
        }
    }

    capitalize = (field, value) => {
        if (!value || typeof value !== 'string') return
        if (field === 'utilizacao') {
            if (value === 'RODOVIARIO') value = 'CONVENCIONAL'
            if (value === 'SEMI LEITO - EXECUTIVO') value = 'Semi-Leito'
            if (value !== 'Semi-Leito') value = value.charAt(0) + value.slice(1).toLowerCase()
        }
        if (field === 'dominio' && value === 'Sim') value = 'Veículo próprio'
        if (field === 'dominio' && value === 'Não') value = 'Possuidor'

        return value
    }

    handleBlur = async e => {
        const
            { empresas, vehicleLogs, equipamentos, acessibilidade } = this.props.redux,
            { frota, demand } = this.state,
            { name } = e.target

        let
            { value } = e.target

        const errors = checkInputErrors()
        if (errors) this.setState({ errors })
        else this.setState({ errors: undefined })

        switch (name) {

            case 'compartilhado':
                this.getId(name, value, empresas, 'delegatarioCompartilhado', 'razaoSocial', 'delegatarioId')
                break;
            case 'delegatario':
                await this.getId(name, value, empresas, 'delegatarioId', 'razaoSocial', 'delegatarioId')
                break;
            default:
                void 0
        }
        if (name === 'placa' && value.length > 2 && Array.isArray(this.state.frota)) {

            let vehicle = this.state.frota.find(v => {
                if (typeof value === 'string') return v.placa.toLowerCase().match(value.toLowerCase())
                else return v.placa.match(value)
            })

            if (vehicle && typeof vehicle === 'object') {

                let
                    utilizacao = this.capitalize('utilizacao', vehicle?.utilizacao) || null,
                    dominio = this.capitalize('dominio', vehicle?.dominio) || null,
                    resetEquips = {}

                //Every time a new vehicle is selected, clear the equips/acessibilidade. Method this.setEquipa() will set it back.
                const allEquips = equipamentos.concat(acessibilidade)
                allEquips.forEach(({ item }) => Object.assign(resetEquips, { [item]: false }))

                //Add few mor properties to vehicle and preserve vehicle before changes.
                vehicle = Object.assign({}, vehicle, { utilizacao, dominio })
                const originalVehicle = Object.freeze(vehicle)

                //setState()
                await this.setState({ ...resetEquips, ...vehicle, originalVehicle, disable: true })

                if (vehicle !== undefined && vehicle.hasOwnProperty('empresa')) this.setState({ delegatario: vehicle.empresa })

                if (!demand) {
                    const customTitle = 'Solicitação já cadastrada',
                        customMessage = `Já existe uma demanda aberta para o veículo de placa ${vehicle.placa}. Para acessá-la, clique em "Solicitações" no menu superior.`

                    const demandExists = checkDemand(vehicle?.veiculoId, vehicleLogs)
                    if (demandExists) {
                        await this.setState({ customTitle, customMessage, openAlertDialog: true, delegatario: '' })
                        this.reset()
                        return
                    }
                }
            }

            if (this.state.placa !== '' && !vehicle) {
                let reset = {}
                if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
                this.setState({ alertType: 'plateNotFound', openAlertDialog: true })
                this.setState({ ...reset, disable: false })
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

    handleCheck = async (item, type) => {
        const collection = this.props.redux[type]

        if (!collection) return

        let array = [], ids = [], stateKey

        if (type === 'equipamentos') stateKey = 'equipa'
        if (type === 'acessibilidade') stateKey = 'acessibilidadeId'

        await this.setState({ ...this.state, [item]: !this.state[item] })

        collection.forEach(({ id, item }) => {
            if (this.state[item] === true) {
                array.push(item)
                ids.push(id)
            }
        })

        if (array[0]) this.setState({ [type]: array, [stateKey]: ids })
        else if (type === 'equipamentos') this.setState({ equipamentos: [], [stateKey]: [] })
        else if (type === 'acessibilidade') this.setState({ acessibilidade: [], [stateKey]: [] })
    }

    showAltPlaca = () => {
        const title = 'Alteração de placa',
            header = 'Para alterar a placa do veículo para o padrão Mercosul, digite a placa no campo abaixo e anexe o CRLV atualizado do veículo.'
        this.setState({ altPlaca: true, title, header })
    }

    updatePlate = () => {
        this.setState({ placa: this.state.newPlate })
        this.toggleDialog()
    }

    handleSubmit = async (approved) => {
        const
            { veiculoId, poltronas, pesoDianteiro, pesoTraseiro, delegatarioId, originalVehicle, showPendencias, getUpdatedValues,
                delegatarioCompartilhado, newPlate, selectedEmpresa, equipa, acessibilidadeId, info, demand, form, demandFiles } = this.state,

            oldHistoryLength = demand?.history?.length || 0

        //****************************Prepare the request Object*******************************
        let tempObj = {}

        altForm.forEach(form => {
            form.forEach(obj => {
                for (let k in this.state) {
                    if (k === obj.field && !obj.disabled) {
                        if (this.state[k]) Object.assign(tempObj, { [k]: this.state[k] })
                    }
                }
            })
        })

        let pbt = Number(poltronas) * 93 + (Number(pesoDianteiro) + Number(pesoTraseiro))
        if (isNaN(pbt)) pbt = undefined

        tempObj = Object.assign(tempObj, { delegatarioId, delegatarioCompartilhado, pbt, equipa, acessibilidadeId })
        
        /*  Object.keys(tempObj).forEach(key => {
             if (tempObj[key] && originalVehicle[key]) {
 
                 if (key === 'equipa' || key === 'acessibilidadeId')
                     tempObj[key].sort((a, b) => a - b)
 
                 if (tempObj[key].toString() === originalVehicle[key].toString())
                     delete tempObj[key]
             }
             if (tempObj[key] === '' || tempObj[key] === 'null' || !tempObj[key]) delete tempObj[key]
         }) */
         
         let { placa, delegatario, compartilhado, ...camelizedRequest } = tempObj
         
         tempObj = getUpdatedValues(originalVehicle, tempObj)  //Save only real changes to the request Object (method from setDemand())

        if (newPlate && newPlate !== '')
            camelizedRequest.placa = newPlate

        if ((!this.state.compartilhado || this.state.compartilhado === '') && originalVehicle?.delegatarioCompartilhado)
            camelizedRequest.delegatarioCompartilhado = 'NULL'


        if (!approved && Object.keys(camelizedRequest).length === 0) {
            this.setState({ openAlertDialog: true, customTitle: 'Nenhuma alteração', customMessage: 'Não foi realizada nenhuma alteração na solicitação aberta. Para prosseguir, altere algum dos campos ou adicione uma justificativa.' })
            return
        }
        const requestObject = humps.decamelizeKeys(camelizedRequest)

        //******************GenerateLog********************** */
        let history = {
            alteracoes: camelizedRequest,
            info
        }

        /* if (showPendencias && pendencias && pendencias !== '') history.info = pendencias
        else if (justificativa && justificativa !== '') history.info = justificativa
 */
        let log = {
            empresaId: selectedEmpresa?.delegatarioId,
            veiculoId,
            history,
            files: form,
            demandFiles,
            historyLength: oldHistoryLength
        }

        if (demand) log.id = demand?.id
        if (approved) log.completed = true

        logGenerator(log)
            .then(r => console.log(r?.data))
            .catch(err => console.log(err))

        //*********************if approved, putRequest to update DB  ********************** */
        if (demand && approved && !showPendencias) {
            if (selectedEmpresa.delegatarioId !== delegatarioId) requestObject.apolice = 'Seguro não cadastrado'

            const
                table = 'veiculo',
                tablePK = 'veiculo_id'

            await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: veiculoId })
        }

        //******************Clear the state ********************** */        
        this.reset(true)
        this.toast()
        await this.setState({ activeStep: 0 })

        if (demand) this.props.history.push('/solicitacoes')
    }

    handleFiles = async (files, name) => {

        const { veiculoId } = this.state

        let formData = new FormData()
        formData.append('veiculoId', veiculoId)

        if (files && files[0]) {
            await this.setState({ [name]: files[0] })

            const newState = handleFiles(files, formData, this.state, altDadosFiles)
            this.setState({ ...newState, fileToRemove: null })
        }
    }

    removeFile = async (name) => {
        const
            { form } = this.state,
            newState = removeFile(name, form)

        this.setState({ ...this.state, ...newState })
    }  

    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ altPlaca: !this.state.altPlaca })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    closeEquipa = () => this.setState({ addEquipa: false })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })
    reset = resetAll => {

        let resetFiles = {}

        altForm.forEach(form => form.forEach(el => this.setState({ [el.field]: '' })))
        altDadosFiles.forEach(({ name }) => {
            Object.assign(resetFiles, { [name]: undefined })
        })
        if (resetAll) this.setState({ ...resetFiles, form: undefined, selectedEmpresa: undefined, razaoSocial: undefined })
        else this.setState({ ...resetFiles, form: undefined })
    }

    render() {

        const
            { empresas, equipamentos, acessibilidade } = this.props.redux,

            { confirmToast, toastMsg, stepTitles, activeStep, steps, altPlaca, selectedEmpresa, openAlertDialog, alertType, customTitle, customMessage,
                dropDisplay, form, title, header, newPlate, demand, showPendencias, info, demandFiles } = this.state

        return <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Alteração de dados' demand={demand} />
            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                stepTitles={stepTitles}
                setActiveStep={this.setActiveStep}
            />
            {activeStep < 2 && <AltDadosTemplate
                data={this.state}
                empresas={empresas}
                equipamentos={equipamentos}
                acessibilidade={acessibilidade}
                setActiveStep={this.setActiveStep}
                altPlacaOption={activeStep === 0}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                showAltPlaca={this.showAltPlaca}
                handleEquipa={this.handleEquipa}
                handleCheck={this.handleCheck}
                close={this.closeEquipa}
            />}
            {activeStep === 2 && <VehicleDocs
                parentComponent='altDados'
                dropDisplay={dropDisplay}
                formData={form}
                handleFiles={this.handleFiles}
                demandFiles={demandFiles}
                fileToRemove={this.state.fileToRemove}
                removeFile={this.removeFile}
            />}
            {activeStep === 3 && <Review
                parentComponent='altDados'
                data={this.state}
                form={altForm}
                files={this.state.form}
                filesForm={altDadosFiles}
            />}
            {selectedEmpresa && <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                handleSubmit={this.handleSubmit}
                setActiveStep={this.setActiveStep}
                showPendencias={showPendencias}
                setShowPendencias={this.setShowPendencias}
                info={info}
                handleInput={this.handleInput}
                demand={demand}
            />}
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            <FormDialog
                open={altPlaca}
                close={this.toggleDialog}
                title={title}
                header={header}
                inputNames={['newPlate']}
                inputLabels={['Alterar Placa']}
                fileInputName='newPlateDoc'
                values={[newPlate]}
                handleInput={this.handleInput}
                handleFiles={this.handleFiles}
                confirm={this.updatePlate}
                dropDisplay={dropDisplay}
                formData={form}
            />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customMessage={customMessage} customTitle={customTitle} />}
        </Fragment>
    }
}

const collections = ['veiculos', 'empresas', 'equipamentos', 'acessibilidade', 'getFiles/vehicleDocs'];

export default StoreHOC(collections, AltDados)