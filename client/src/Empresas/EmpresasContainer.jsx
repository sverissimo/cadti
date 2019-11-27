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
        activeStep: 2,
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
        dropDisplay: 'Clique ou arraste para anexar o Contrato Social atualizado da empresa',
        procFiles: new FormData()
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

        //if (prevActiveStep === 1 && action === 'next' && this.state.totalShare < 100) this.createAlert('subShared')
    }

    handleInput = async e => {
        const { name } = e.target
        let { value } = e.target
        this.setState({ [name]: value })
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

        if (invalid > 0) {
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
                await this.setState({ procuradores: socios })
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
            let procuradores = this.state.procuradores
            procuradores.splice(index, 1)
            this.setState({ procuradores })
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


    toast = e => {
        this.setState({ confirmToast: !this.state.confirmToast })
    }

    handleFiles = (file) => {
        const { activeStep } = this.state
        let formData = new FormData()
        if (activeStep === 0) {
            formData.append('contratoSocial', file[0])

            this.setState({ dropDisplay: file[0].name, form: formData })
        }
        if (activeStep === 2) {
            let procFiles = this.state.procFiles
            procFiles.append(this.state.cpfProcurador, file[0])
            this.setState({ procFiles })

            for (let pair of this.state.procFiles.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
        }

    }

    handleSubmit = async () => {

        let { socios, procuradores, procFiles, form } = this.state,
            empresa = {},
            procData = new FormData(),
            contratoFile = new FormData(),
            empresaId

        empresasForm.forEach(e => {
            if (this.state.hasOwnProperty([e.field])) {
                Object.assign(empresa, { [e.field]: this.state[e.field] })
            }
        })
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
        for (let pair of form.entries()) {
            contratoFile.append(pair[0], pair[1])
        }
        await axios.post('/api/empresaUpload', contratoFile)
            .then(r => console.log(r.data))


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
        const { stepTitles, activeStep, confirmToast, toastMsg, steps, openDialog, dialogTitle, message } = this.state

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
                        />
                        :
                        <EmpresaReview
                            data={this.state}
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