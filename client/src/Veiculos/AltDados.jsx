import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import { checkDemand } from '../Utils/checkDemand'
import { checkInputErrors } from '../Utils/checkInputErrors'
import ReactToast from '../Utils/ReactToast'
import { altDadosFiles } from '../Forms/altDadosFiles'
import { altForm } from '../Forms/altForm'
import { logGenerator } from '../Utils/logGenerator'

import Crumbs from '../Reusable Components/Crumbs'
import CustomStepper from '../Utils/Stepper'

import AltDadosTemplate from './AltDadosTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './VehicleReview'
import StepperButtons from '../Utils/StepperButtons'

import FormDialog from '../Reusable Components/FormDialog'
import AlertDialog from '../Utils/AlertDialog'


class AltDados extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.addEquipa) this.handleEquipa()
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
        fileNames: [],
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
            { veiculos, empresas } = redux

        let equipamentos = {}, alteracoes, compartilhado

        const
            demand = this.props?.location?.state?.demand,
            history = demand?.history

        if (Array.isArray(history)) alteracoes = history.reverse().find(el => el.hasOwnProperty('alteracoes')).alteracoes

        if (demand) {
            const
                vehicle = veiculos.find(v => v.veiculoId.toString() === demand.veiculoId.toString()),
                originalVehicle = Object.freeze(vehicle)

            const
                vehicleData = JSON.parse(JSON.stringify(vehicle)),
                selectedEmpresa = empresas.find(e => e.razaoSocial === demand?.empresa),
                razaoSocial = selectedEmpresa?.razaoSocial,
                delegatario = razaoSocial,
                selectedVehicle = Object.assign(vehicleData, alteracoes)

            if (history) {
                const
                    length = history?.length,
                    delCompartilhado = history[length - 1]?.alteracoes?.delegatarioCompartilhado

                if (delCompartilhado) {
                    compartilhado = empresas.find(e => e.delegatarioId === delCompartilhado)?.razaoSocial
                    if (alteracoes && typeof alteracoes === 'object') alteracoes.compartilhado = compartilhado
                }
            }

            await this.setState({ ...selectedVehicle, selectedVehicle, originalVehicle, delegatario, compartilhado, razaoSocial, selectedEmpresa, demand, alteracoes, activeStep: 3 })
        }

        if (redux && redux.equipamentos) {
            redux.equipamentos.forEach(e => Object.assign(equipamentos, { [e.item]: false }))
            const equipArray = Object.keys(equipamentos)
            await this.setState({ equipamentos: equipArray, ...equipamentos })
        }
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
        const { veiculos, empresas } = this.props.redux,
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
            if (!vehicle) this.state.equipamentos.forEach(e => this.setState({ [e]: false }))
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
            { empresas, vehicleLogs } = this.props.redux,
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
                    dominio = this.capitalize('dominio', vehicle?.dominio) || null

                if (vehicle.equipamentosId) this.setEquipa(vehicle)

                vehicle = Object.assign({}, vehicle, { utilizacao, dominio })

                const originalVehicle = Object.freeze(vehicle)

                await this.setState({ ...vehicle, originalVehicle, disable: true })
                if (vehicle !== undefined && vehicle.hasOwnProperty('empresa')) this.setState({ delegatario: vehicle.empresa })

                if (!demand) {
                    const customTitle = 'Solicitação já cadastrada',
                        customMessage = `Já existe uma demanda aberta para o veículo de placa ${vehicle.placa}. Para acessá-la, clique em "Solicitações" no menu superior.`

                    const demandExists = checkDemand(vehicle?.veiculoId, vehicleLogs)
                    if (demandExists) {
                        this.setState({ customTitle, customMessage, openAlertDialog: true, delegatario: '' })
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
    setEquipa = vehicle => {
        const
            { equipamentos } = this.state,
            currentEquipa = vehicle.equipamentosId
        let vEquip = []

        equipamentos.forEach(e => {
            if (currentEquipa.toLowerCase().match(e.toLowerCase())) vEquip.push(e)
        })
        vEquip.forEach(ve => this.setState({ [ve]: true }))
        this.setState({ equipamentosId: vEquip })
    }

    handleCheck = async item => {
        const { equipamentos } = this.state
        let array = []
        await this.setState({ ...this.state, [item]: !this.state[item] })

        equipamentos.forEach(e => {
            if (this.state[e] === true) {
                array.push(e)
            }
        })
        if (array[0]) this.setState({ equipamentosId: array })
        else this.setState({ equipamentosId: [] })
    }

    handleEquipa = async () => {
        const { demand, selectedVehicle } = this.state

        if (demand) await this.setEquipa(selectedVehicle)
        this.setState({ addEquipa: !this.state.addEquipa })
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
            { veiculoId, poltronas, pesoDianteiro, pesoTraseiro, delegatarioId, originalVehicle, showPendencias, pendencias,
                delegatarioCompartilhado, equipamentosId, newPlate, selectedEmpresa, justificativa, demand } = this.state,

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

        tempObj = Object.assign(tempObj, { delegatarioId, delegatarioCompartilhado, pbt, equipamentosId })
        console.log(tempObj)

        //Save only real changes to the request Object
        Object.keys(tempObj).forEach(key => {
            if (tempObj[key] && originalVehicle[key]) {
                if (key === 'equipamentosId') {
                    if (typeof tempObj[key] === 'string') tempObj[key] = tempObj[key].split(',')
                    if (tempObj[key].sort().toString() === originalVehicle[key].toString())
                        delete tempObj[key]
                }
                else if (tempObj[key].toString() === originalVehicle[key].toString()) {
                    delete tempObj[key]
                }
            }
            if (tempObj[key] === '' || tempObj[key] === 'null' || !tempObj[key]) delete tempObj[key]
        })

        let { placa, delegatario, compartilhado, ...camelizedRequest } = tempObj

        if (newPlate && newPlate !== '')
            camelizedRequest.placa = newPlate

        if ((!this.state.compartilhado || this.state.compartilhado === '') && originalVehicle?.delegatarioCompartilhado)
            camelizedRequest.delegatarioCompartilhado = 'NULL'

        const requestObject = humps.decamelizeKeys(camelizedRequest)

        //******************GenerateLog********************** */
        let history = { alteracoes: camelizedRequest }
        if (showPendencias && pendencias && pendencias !== '') history.info = pendencias
        else if (justificativa && justificativa !== '') history.info = justificativa

        let log = {
            empresaId: selectedEmpresa?.delegatarioId,
            veiculoId,
            history,
            historyLength: oldHistoryLength
        }

        if (demand) log.id = demand?.id
        if (approved) log.completed = true

        logGenerator(log).then(r => console.log(r.data))
        await this.submitFiles()

        //*********************if approved, putRequest to update DB  ********************** */
        if (demand && approved && !showPendencias) {
            if (selectedEmpresa.delegatarioId !== delegatarioId) requestObject.apolice = 'Seguro não cadastrado'

            const
                table = 'veiculo',
                tablePK = 'veiculo_id'

            await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: veiculoId })
        }

        //******************Clear the state ********************** */
        //this.setState({ activeStep: 0, razaoSocial: '', selectedEmpresa: undefined })
        this.reset()
        this.toast()
        await this.setState({})
        if (demand) this.props.history.push('/solicitacoes')
    }

    handleFiles = async (files, name) => {

        if (files && files[0]) {
            console.log(files, name)
            let formData = new FormData()
            formData.append('veiculoId', this.state.veiculoId)

            let fn = this.state.fileNames

            if (files && files.length > 0) {

                fn.push({ [name]: files[0].name })
                await this.setState({ filesNames: fn, [name]: files[0] })

                altDadosFiles.forEach(({ name }) => {
                    for (let keys in this.state) {
                        if (keys.match(name) && this.state[name]) {
                            formData.append(name, this.state[name])
                        }
                        else void 0
                    }
                })
                this.setState({ form: formData })
            }
        }
    }

    submitFiles = () => {
        const { form } = this.state

        if (form) axios.post('/api/vehicleUpload', form)
            .then(res => console.log('uploaded'))
            .catch(err => console.log(err))
    }

    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ altPlaca: !this.state.altPlaca })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })
    reset = () => {

        let resetFiles = {}

        altForm.forEach(form => form.forEach(el => this.setState({ [el.field]: '' })))
        altDadosFiles.forEach(({ name }) => {
            Object.assign(resetFiles, { [name]: undefined })
        })
        this.setState({ ...resetFiles, form: undefined })
    }

    render() {

        const
            { empresas, equipamentos } = this.props.redux,

            { confirmToast, toastMsg, stepTitles, activeStep, steps, altPlaca, selectedEmpresa, openAlertDialog, alertType, customTitle, customMessage,
                dropDisplay, form, title, header, newPlate, demand, showPendencias, pendencias } = this.state

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
                setActiveStep={this.setActiveStep}
                altPlacaOption={activeStep === 0}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                showAltPlaca={this.showAltPlaca}
                handleEquipa={this.handleEquipa}
                handleCheck={this.handleCheck}
            />}
            {activeStep === 2 && <VehicleDocs
                parentComponent='altDados'
                handleFiles={this.handleFiles}
                dropDisplay={dropDisplay}
                formData={form}
            />}
            {activeStep === 3 && <Review
                parentComponent='altDados' files={this.state.form}
                filesForm={altDadosFiles} data={this.state}
                form={altForm}
            />}

            {selectedEmpresa && <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                handleSubmit={this.handleSubmit}
                setActiveStep={this.setActiveStep}
                rejectDemand={this.rejectDemand}
                showPendencias={showPendencias}
                setShowPendencias={this.setShowPendencias}
                pendencias={pendencias}
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

const collections = ['veiculos', 'empresas', 'equipamentos', 'acessibilidade'];

export default StoreHOC(collections, AltDados)