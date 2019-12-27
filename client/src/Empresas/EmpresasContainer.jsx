import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import EmpresasTemplate from './EmpresasTemplate'
import SociosTemplate from './SociosTemplate'
import EmpresaReview from './EmpresaReview'

import { empresasForm } from '../Forms/empresasForm'
import { sociosForm } from '../Forms/sociosForm'
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
            'Revisão'],
        steps: ['Dados da Empresa', 'Sócios', 'Revisão'],
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
        dropDisplay: 'Clique ou arraste para anexar o contrato social atualizado da empresa',
        showFiles: false
    }

    componentDidMount() {
        axios.get('/api/empresas')
            .then(res => humps.camelizeKeys(res.data))
            .then(empresas => this.setState({ empresas }))

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
        const { name, value } = e.target
        this.setState({ [name]: value })
    }

    addSocio = async () => {
        let socios = this.state.socios,
            form = sociosForm,
            sObject = {},
            invalid = 0,
            totalShare = 0

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
    }


    enableEdit = index => {

        let editSocio = this.state.socios
        if (editSocio[index].edit === true) editSocio[index].edit = false
        else {
            editSocio.forEach(s => s.edit = false)
            editSocio[index].edit = true
        }
        this.setState({ socios: editSocio })

    }

    handleEdit = e => {
        const { name, value } = e.target,
            { socios } = this.state        
        let editSocio = socios.filter(s => s.edit === true)[0]
        const index = socios.indexOf(editSocio)

        editSocio[name] = value

        let fs = socios
        fs[index] = editSocio

        this.setState({ filteredSocios: fs })

    }

    removeSocio = index => {
        let socios = this.state.socios
        socios.splice(index, 1)
        this.setState({ socios })
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
        let formData = new FormData()
        formData.append('contratoSocial', file[0])
        this.setState({ dropDisplay: file[0].name, contratoSocial: formData })
    }

    handleSubmit = async () => {

        let { socios, contratoSocial } = this.state,
            empresa = {},
            contratoFile = new FormData(),
            empresaId

        empresasForm.forEach(e => {
            if (this.state.hasOwnProperty([e.field])) {
                Object.assign(empresa, { [e.field]: this.state[e.field] })
            }
        })

        empresa.delegatarioStatus = 'Ativo'

        Object.entries(socios).forEach(([k, v]) => {
            if (!socios[k]) socios[k] = null
        })

        empresa = humps.decamelizeKeys(empresa)
        socios = humps.decamelizeKeys(socios)

        await axios.post('/api/empresaFullCad', { empresa, socios })
            .then(delegatarioId => empresaId = delegatarioId.data)

        contratoFile.append('fieldName', 'contratoSocial')
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

    toast = () => this.setState({ confirmToast: !this.state.confirmToast })
    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    showFiles = () => this.setState({ showFiles: true })
    closeFiles = () => this.setState({ showFiles: !this.state.showFiles })

    render() {

        const { activeStep, confirmToast, toastMsg, steps, openDialog, dialogTitle, message } = this.state

        return <Fragment>

            <Crumbs links={['Empresas', '/empresasHome']} text='Cadastro de empresas' />

            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                setActiveStep={this.setActiveStep}
            />
            {
                activeStep === 0 ?
                    <EmpresasTemplate
                        data={this.state}
                        handleInput={this.handleInput}
                        handleBlur={this.handleBlur}
                        handleFiles={this.handleFiles}
                    />
                    : activeStep === 1 ?
                        <SociosTemplate
                            data={this.state}
                            handleInput={this.handleInput}
                            handleBlur={this.handleBlur}
                            addSocio={this.addSocio}
                            removeSocio={this.removeSocio}
                            handleFiles={this.handleFiles}
                            enableEdit={this.enableEdit}
                            handleEdit={this.handleEdit}
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