import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import EmpresasTemplate from './EmpresasTemplate'

import StepperButtons from '../Utils/StepperButtons'
import CustomStepper from '../Utils/Stepper'

import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import AlertDialog from '../Utils/AlertDialog'
import SociosTemplate from './SociosTemplate'

export default class extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.addEquipa) this.handleEquipa()
            }
        }
    }

    state = {
        activeStep: 0,
        stepTitles: ['Preencha os dados da empresa', 'Informações sobre os sócios',
            'Informações sobre os procuradores'],
        steps: ['Dados da Empresa', 'Sócios', 'Procuradores', 'Revisão'],
        form: {},
        empresas: [],
        razaoSocial: '',
        frota: [],
        toastMsg: 'Delegatário cadastrado!',
        confirmToast: false,
        files: [],
        fileNames: [],
        activeStep: 0,
        openDialog: false
    }

    async componentDidMount() {
        const veiculos = axios.get('/api/veiculosInit')
        const empresas = axios.get('/api/empresas')

        await Promise.all([veiculos, empresas])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([veiculos, empresas]) => {
                this.setState({ veiculos, empresas })
            })

        document.addEventListener('keydown', this.escFunction, false)
    }
    componentWillUnmount() { this.setState({}) }

    setActiveStep = async action => {

        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })

        console.log(this.state.activeStep)
    }

    handleInput = async e => {
        const { name } = e.target
        let { value } = e.target
        this.setState({ [name]: value })
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
        const { empresas } = this.state
        const { name } = e.target
        let { value } = e.target

        switch (name) {
            case 'cnpj':
                const alreadyExists = empresas.filter(e => e.cnpj === value)
                if (alreadyExists[0]) {
                    this.setState({ cnpj: '' })
                    this.createAlert(alreadyExists[0])
                }
                break;
        }

    }

    handleCadastro = async e => {

    }

    toast = e => {
        this.setState({ confirmToast: !this.state.confirmToast })
    }

    handleFiles = async e => {
        const { name, files } = e.target

        if (files && files[0]) {

            document.getElementById(name).value = files[0].name

            let formData = new FormData()

            let fn = this.state.fileNames

            if (files && files.length > 0) {

                fn.push({ [name]: files[0].name })
                await this.setState({ filesNames: fn, [name]: files[0] })

                cadVehicleFiles.forEach(({ name }) => {
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

    submitFiles = async e => {
        const { form } = this.state

        await axios.post('/api/mongoUpload', form)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
        this.toast()
    }

    handleCheck = item => {
        this.setState({ ...this.state, [item]: !this.state[item] })
    }


    toggleDialog = () => {
        this.setState({ openDialog: !this.state.openDialog })
    }

    createAlert = (alert) => {
        let dialogTitle, message
        if (typeof alert === 'object') {
            dialogTitle = 'Empresa já cadastrada'
            message = `A empresa ${alert.razaoSocial} já está cadastrada no sistema com o CNPJ ${alert.cnpj}.`
        }
        else switch (alert) {
            case 'whatever':
                dialogTitle = 'Empresa já cadastrada'
                message = 'O CNPJ informado já está cadastrado.'
                break;
            default:
                break;
        }
        this.setState({ openDialog: true, dialogTitle, message })
    }

    showFiles = id => {

        let selectedFiles = this.state.files.filter(f => f.metadata.veiculoId === id.toString())

        if (selectedFiles[0]) {
            this.setState({ filesCollection: selectedFiles, showFiles: true, selectedVehicle: id })

        } else {
            this.createAlert('filesNotFound')
            this.setState({ filesCollection: [] })
        }
    }

    render() {
        const {stepTitles, activeStep, confirmToast, toastMsg, steps, openDialog, dialogTitle, message } = this.state

        return <Fragment>
            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                stepTitles={stepTitles}
                setActiveStep={this.setActiveStep}
            />
            {
                activeStep === 0 ?
                    <EmpresasTemplate
                        data={this.state}
                        handleInput={this.handleInput}
                        handleBlur={this.handleBlur}
                        handleCheck={this.handleCheck}
                    />
                    :
                    <SociosTemplate
                        data={this.state}
                        handleInput={this.handleInput}
                        handleBlur={this.handleBlur}
                        handleCheck={this.handleCheck}
                    />
            }
            <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                handleSubmit={this.handleCadastro}
                setActiveStep={this.setActiveStep}
            />
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            <AlertDialog open={openDialog} close={this.toggleDialog} title={dialogTitle} message={message} />
        </Fragment>
    }
}