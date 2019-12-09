import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import EmpresasTemplate from './EmpresasTemplate'
import SociosTemplate from './SociosTemplate'
import EmpresaReview from './EmpresaReview'

import { empresasForm } from '../Forms/empresasForm'
import { sociosForm } from '../Forms/sociosForm'
import { procuradorForm } from '../Forms/procuradorForm'
import Crumbs from '../Utils/Crumbs'

import StepperButtons from '../Utils/StepperButtons'
import CustomStepper from '../Utils/Stepper'
import AlertDialog from '../Utils/AlertDialog'

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
            'Informações sobre os procuradores', 'Revisão'],
        steps: ['Dados da Empresa', 'Sócios', 'Procuradores', 'Revisão'],
        form: {},
        empresas: [],
        razaoSocial: '',
        frota: [],
        toastMsg: 'Empresa cadastrada!',
        confirmToast: false,
        files: [],
        fileNames: [],
        openDialog: false,
        addedSocios: [0],
        totalShare: 0,
        socios: [],
        procuradores: [],
        dropDisplay: 'Clique ou arraste para anexar o contrato social atualizado da empresa',
        procDisplay: 'Clique ou arraste para anexar a procuração referente a este procurador',
        procFiles: new FormData(),
        showFiles: false
    }

    componentDidMount() {
        axios.get('/api/empresas')
            .then(res => humps.camelizeKeys(res.data))
            .then(empresas => this.setState({ empresas }))

        this.setState({ activeStep: this.props.location.tab || 0 })
        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() { this.setState({}) }

    setActiveStep = async action => {

        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })

        //if (prevActiveStep === 1 && action === 'next' && this.state.totalShare < 100) this.createAlert('subShared')
    }

    handleInput = async e => {
        const { name } = e.target
        let { value } = e.target
        this.setState({ [name]: value })
        console.log(this.state)
    }

    addSocio = async () => {
        let socios = this.state.socios,
            form = sociosForm,
            sObject = {},
            invalid = 0,
            totalShare = 0

        if (this.state.activeStep === 2) {
            socios = this.state.procuradores
            form = procuradorForm
        }

        form.forEach(obj => {
            if (this.state[obj.field] === '' || this.state[obj.field] === undefined) {
                invalid += 1
            }
        })

        if (invalid === 100) {
            this.createAlert('missingRequiredFields')
            return null
        } else {
            form.forEach(obj => {
                Object.assign(sObject, { [obj.field]: this.state[obj.field] })
            })
            socios.push(sObject)

            if (this.state.activeStep === 1) {
                socios.forEach(s => {
                    totalShare += Number(s.share)
                })
                if (totalShare > 100) {
                    socios.pop()
                    this.createAlert('overShared')
                }
                else {
                    await this.setState({ socios, totalShare })
                    sociosForm.forEach(obj => {
                        this.setState({ [obj.field]: '' })
                    })
                    document.getElementsByName('nomeSocio')[0].focus()
                }
            }

            if (this.state.activeStep === 2) {
                const lastOne = socios[socios.length - 1]
                for (let pair of this.state.procFiles.entries()) {
                    if (pair[0] === lastOne.cpfProcurador) {
                        socios[socios.length - 1].fileLabel = pair[1].name
                    }
                }
                await this.setState({ procuradores: socios, procDisplay: 'Clique ou arraste para anexar a procuração referente a este procurador' })
                procuradorForm.forEach(obj => {
                    this.setState({ [obj.field]: '' })
                })
                document.getElementsByName('nomeProcurador')[0].focus()
            }
        }
    }

    removeSocio = index => {

        if (this.state.activeStep === 1) {
            let socios = this.state.socios
            socios.splice(index, 1)
            this.setState({ socios })

        } else {

            let form = this.state.procFiles,
                procuradores = this.state.procuradores,
                procurador = procuradores[index]
            if (form.has(procurador.cpfProcurador)) {
                console.log(form.get(procurador.cpfProcurador), 'ssssssssssddsdfmas', index)
                form.delete(procurador.cpfProcurador)
            }
            procuradores.splice(index, 1)
            this.setState({ procuradores, procFiles: form })
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
            case 'share':
                if (value > 100) {
                    this.createAlert('overShared')
                }
                else {
                    const totalShare = Number(this.state.totalShare) + Number(value)
                    this.setState({ [name]: value, totalShare })
                }
                break;
            default:
                break;
        }

    }

    handleFiles = (file) => {
        const { activeStep } = this.state
        let formData = new FormData()
        if (activeStep === 0) {
            formData.append('contratoSocial', file[0])

            this.setState({ dropDisplay: file[0].name, contratoSocial: formData })
        }
        if (activeStep === 2) {
            let procFiles = this.state.procFiles
            procFiles.append(this.state.cpfProcurador, file[0])
            this.setState({ procFiles, procDisplay: file[0].name })
        }
    }

    changeFile = async (e) => {

        e.persist()
        const i = e.target.name,
            file = e.target.files[0]

        let form = this.state.procFiles,
            { procuradores } = this.state,
            procurador = procuradores[i]

        if (file && form.has(procurador.cpfProcurador)) {
            form.set(procurador.cpfProcurador, file)
            procuradores[i].fileLabel = file.name
        }
        await this.setState({ procFiles: form, procuradores })

        for (let pair of this.state.procFiles.entries()) {
            console.log(pair[0], ' ', pair[1])
        }
    }

    handleSubmit = async () => {

        let { socios, procuradores, procFiles, contratoSocial } = this.state,
            empresa = {},
            procData = new FormData(),
            contratoFile = new FormData(),
            empresaId

        empresasForm.forEach(e => {
            if (this.state.hasOwnProperty([e.field])) {
                Object.assign(empresa, { [e.field]: this.state[e.field] })
            }
        })

        procuradores.forEach(proc => delete proc.fileLabel)

        empresa.delegatarioStatus = 'Ativo'
        empresa = humps.decamelizeKeys(empresa)
        socios = humps.decamelizeKeys(socios)
        procuradores = humps.decamelizeKeys(procuradores)

        await axios.post('/api/empresaFullCad', { empresa, socios, procuradores })
            .then(async delegatarioId => empresaId = delegatarioId.data)

        procData.append('fieldName', 'procFile')
        procData.append('empresaId', empresaId)
        for (let pair of procFiles.entries()) {
            procData.append(pair[0], pair[1])
        }

        await axios.post('/api/empresaUpload', procData)
            .then(r => console.log(r.data))

        contratoFile.append('empresaId', empresaId)
        for (let pair of contratoSocial.entries()) {
            contratoFile.append(pair[0], pair[1])
        }
        await axios.post('/api/empresaUpload', contratoFile)
            .then(r => console.log(r.data))

        this.toast()
    }

    createAlert = (alert) => {
        let dialogTitle, message
        if (typeof alert === 'object') {
            dialogTitle = 'Empresa já cadastrada'
            message = `A empresa ${alert.razaoSocial} já está cadastrada no sistema com o CNPJ ${alert.cnpj}.`
        }
        else switch (alert) {
            case 'overShared':
                dialogTitle = 'Participação societária inválida.'
                message = 'A participação societária informada excede a 100%.'
                break;
            case 'subShared':
                dialogTitle = 'Participação societária inválida.'
                message = 'A participação societária informada não soma 100%. Favor informar todos os sócios com suas respectivas participações.'
                break;
            case 'missingRequiredFields':
                dialogTitle = 'Campos de preenchimento obrigatório.'
                message = 'Favor preencher todos os campos do formulário.'
                break;
            default:
                break;
        }
        this.setState({ openDialog: true, dialogTitle, message })
    }

    handleCheck = item => this.setState({ ...this.state, [item]: !this.state[item] })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })
    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    showFiles = () => this.setState({ showFiles: true })
    closeFiles = () => this.setState({ showFiles: !this.state.showFiles })

    render() {
        const { stepTitles, activeStep, confirmToast, toastMsg, steps, openDialog, dialogTitle, message } = this.state

        return <Fragment>

            <Crumbs links={['Empresas', '/empresasHome']} text='Cadastro de empresas'/>

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
                        handleFiles={this.handleFiles}
                    />
                    : activeStep < 3 ?
                        <SociosTemplate
                            data={this.state}
                            handleInput={this.handleInput}
                            handleBlur={this.handleBlur}
                            handleCheck={this.handleCheck}
                            addSocio={this.addSocio}
                            removeSocio={this.removeSocio}
                            handleFiles={this.handleFiles}
                            changeFile={this.changeFile}
                        />
                        :
                        <EmpresaReview
                            data={this.state}
                            showFiles={this.showFiles}
                        />
            }
            <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                handleSubmit={this.handleSubmit}
                setActiveStep={this.setActiveStep}
            />
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            <AlertDialog open={openDialog} close={this.toggleDialog} title={dialogTitle} message={message} />
        </Fragment>
    }
}