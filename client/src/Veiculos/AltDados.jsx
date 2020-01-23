import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import { connect } from 'react-redux'
import { updateData } from '../Redux/updateDataActions'

import VehicleHOC from './VeiculosHOC'

import ReactToast from '../Utils/ReactToast'
import { altDadosFiles } from '../Forms/altDadosFiles'
import { altForm } from '../Forms/altForm'

import Crumbs from '../Utils/Crumbs'
import CustomStepper from '../Utils/Stepper'

import AltDadosTemplate from './AltDadosTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './Review'
import StepperButtons from '../Utils/StepperButtons'

import FormDialog from '../Utils/FormDialog'
import AlertDialog from '../Utils/AlertDialog'

class AltDados extends Component {

    state = {
        stepTitles: ['Informe a placa para alterar os dados abaixo ou mantenha as informações atuais e clique em avançar',
            'Altere os dados desejados abaixo e clique em avançar', 'Anexe os documentos solicitados',
            'Revisão das informações e deferimento'],
        steps: ['Alterar dados do Veículo', 'Alterar dados adicionais', 'Documentos', 'Revisão'],

        subtitle: ['Dados do Veículo', 'Informações adicionais',
            'Anexe os arquivos solicitados', 'Revisão'],
        form: {},
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
        placa: ''
    }

    componentDidMount() {
        this.setState({ ...this.props.redux })       
    }

    componentWillUnmount() { this.setState({}) }

    setActiveStep = action => {
        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })
    }

    handleInput = async e => {
        const { veiculos } = this.state,
            { name, value } = e.target


        if (name === 'razaoSocial') {
            let selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)

                this.setState({ frota })

            } else this.setState({ selectedEmpresa: undefined, frota: [] })
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
            alert(alertLabel + ' não cadastrado')
            document.getElementsByName(name)[0].focus()
        }
    }

    handleBlur = async  e => {
        const { empresas, frota } = this.state
        const { name } = e.target
        let { value } = e.target

        switch (name) {
            case 'compartilhado':
                this.getId(name, value, empresas, 'delegatarioCompartilhado', 'razaoSocial', 'delegatarioId')
                break;
            case 'delegatario':
                await this.getId(name, value, empresas, 'delegatarioId', 'razaoSocial', 'delegatarioId', 'Empresa')
                break;
            default:
                void 0
        }
        if (name === 'placa' && value.length > 2 && Array.isArray(this.state.frota)) {

            const vehicle = this.state.frota.filter(v => {
                if (typeof value === 'string') return v.placa.toLowerCase().match(value.toLowerCase())
                else return v.placa.match(value)
            })[0]
            await this.setState({ ...vehicle, disable: true })

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

    updatePlate = async () => {

        const table = 'veiculo',
            tablePK = 'veiculo_id',
            requestObject = { placa: this.state.newPlate }

        await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
        await this.submitFiles()
        this.toggleDialog()
        this.toast()
    }

    handleSubmit = async () => {
        const { poltronas, pesoDianteiro, pesoTraseiro, delegatarioId, delegatarioCompartilhado } = this.state

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

        tempObj = Object.assign(tempObj, { delegatarioId, delegatarioCompartilhado, pbt })
        tempObj = humps.decamelizeKeys(tempObj)

        const { placa, delegatario, compartilhado, ...requestObject } = tempObj

        const table = 'veiculo',
            tablePK = 'veiculo_id'

        await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
        await this.submitFiles()
        this.toast()
    }

    handleFiles = async e => {
        const { name, files } = e.target

        if (files && files[0]) {

            document.getElementById(name).value = files[0].name

            let formData = new FormData()
            formData.append('veiculoId', this.state.veiculoId)            

            let fn = this.state.fileNames

            if (files && files.length > 0) {

                fn.push({ [name]: files[0].name })
                await this.setState({ filesNames: fn, [name]: files[0] })

                altDadosFiles.forEach(({ name }) => {
                    for (let keys in this.state) {
                        if (keys.match(name)) {
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

        axios.post('/api/mongoUpload', form)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
    }


    toggleDialog = () => this.setState({ altPlaca: !this.state.altPlaca })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { confirmToast, toastMsg, stepTitles, activeStep, steps, altPlaca,
            selectedEmpresa, openAlertDialog, alertType } = this.state

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
                setActiveStep={this.setActiveStep}
                altPlacaOption={activeStep === 0}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                showAltPlaca={this.showAltPlaca}
            />}
            {activeStep === 2 && <VehicleDocs
                parentComponent='altDados'
                handleFiles={this.handleFiles}
                handleSubmit={this.submitFiles}
                handleNames={this.handleNames}
            />}
            {activeStep === 3 && <Review parentComponent='cadastro' data={this.state} />}

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
            />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} />}
        </Fragment>
    }
}

const collections = ['veiculos', 'empresas']

export default connect(null, { updateData })(VehicleHOC(collections, AltDados))