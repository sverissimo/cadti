import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import { checkInputErrors } from '../Utils/checkInputErrors'
import ReactToast from '../Utils/ReactToast'
import { altDadosFiles } from '../Forms/altDadosFiles'
import { altForm } from '../Forms/altForm'

import Crumbs from '../Utils/Crumbs'
import CustomStepper from '../Utils/Stepper'

import AltDadosTemplate from './AltDadosTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './VehicleReview'
import StepperButtons from '../Utils/StepperButtons'

import FormDialog from '../Utils/FormDialog'
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
        dropDisplay: 'Clique ou arraste para anexar'
    }

    async componentDidMount() {
        const { redux } = this.props
        let equipamentos = {}

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

    handleBlur = async  e => {
        const
            { empresas } = this.props.redux,
            { frota, equipamentos } = this.state,
            { name } = e.target
        let
            { value } = e.target,
            vEquip = []

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

            if (vehicle && vehicle.equipamentosId) {
                const currentEquipa = vehicle.equipamentosId
                equipamentos.forEach(e => {
                    if (currentEquipa.toLowerCase().match(e.toLowerCase())) vEquip.push(e)
                })
                vEquip.forEach(ve => this.setState({ [ve]: true }))
            }



            if (vehicle && vehicle.utilizacao) {
                vehicle.utilizacao = this.capitalize('utilizacao', vehicle.utilizacao)
            }

            if (vehicle && vehicle.dominio) {
                vehicle.dominio = this.capitalize('dominio', vehicle.dominio)
            }

            await this.setState({ ...vehicle, equipamentosId: vEquip, disable: true })

            if (vehicle !== undefined && vehicle.hasOwnProperty('empresa')) this.setState({ delegatario: vehicle.empresa })

            let reset = {}
            if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
            if (this.state.placa !== '' && !vehicle) {
                this.setState({ alertType: 'plateNotFound', openAlertDialog: true })
                this.setState({ ...reset, disable: false })
            }
        }
    }

    showAltPlaca = () => {
        const title = 'Alteração de placa',
            message = 'Para alterar a placa para o novo padrão Mercosul, informe a nova placa no campo abaixo.'
        this.setState({ altPlaca: true, title, message })
    }

    updatePlate = () => {
        this.setState({ placa: this.state.newPlate })
        this.toggleDialog()
    }

    handleSubmit = async () => {
        const { poltronas, pesoDianteiro, pesoTraseiro, delegatarioId,
            delegatarioCompartilhado, equipamentosId, newPlate, selectedEmpresa } = this.state

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

        tempObj = Object.assign(
            tempObj, { delegatarioId, delegatarioCompartilhado, pbt, equipamentosId })

        tempObj = humps.decamelizeKeys(tempObj)

        Object.keys(tempObj).forEach(key => {
            if (tempObj[key] === '' || tempObj[key] === 'null' || !tempObj[key]) delete tempObj[key]
        })

        const { placa, delegatario, compartilhado, ...requestObject } = tempObj

        if (newPlate && newPlate !== '') requestObject.placa = newPlate
        if (selectedEmpresa.delegatarioId !== delegatarioId) requestObject.apolice = 'Seguro não cadastrado'

        const table = 'veiculo',
            tablePK = 'veiculo_id'

        await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
        await this.submitFiles()
        this.setState({ activeStep: 0, razaoSocial: '', selectedEmpresa: undefined })
        this.reset()
        this.setState({})
        this.toast()

    }

    handleFiles = async (files, name) => {

        if (files && files[0]) {

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

        axios.post('/api/vehicleUpload', form)
            .then(res => console.log('uploaded'))
            .catch(err => console.log(err))
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

    handleEquipa = () => this.setState({ addEquipa: !this.state.addEquipa })
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
            { confirmToast, toastMsg, stepTitles, activeStep, steps, altPlaca,
                selectedEmpresa, openAlertDialog, alertType, dropDisplay, form } = this.state,
            { empresas, equipamentos } = this.props.redux

        return <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Alteração de dados' />
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
            />}
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            <FormDialog
                open={altPlaca}
                close={this.toggleDialog}
                newPlate={this.state.newPlate}
                handleInput={this.handleInput}
                handleFiles={this.handleFiles}
                updatePlate={this.updatePlate}
                dropDisplay={dropDisplay}
                formData={form}
            />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customMessage={this.state.customMsg} />}
        </Fragment>
    }
}

const collections = ['veiculos', 'empresas', 'equipamentos'];

export default StoreHOC(collections, AltDados)