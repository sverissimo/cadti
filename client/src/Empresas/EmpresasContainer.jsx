import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Reusable Components/ReactToast'

import StoreHOC from '../Store/StoreHOC'

import { checkInputErrors } from '../Utils/checkInputErrors'
import EmpresasTemplate from './EmpresasTemplate'
import SociosTemplate from './SociosTemplate'
import EmpresaCadReview from './EmpresaCadReview'

import valueParser from '../Utils/valueParser'
import { empresaFiles } from '../Forms/empresaFiles'
import { empresasForm } from '../Forms/empresasForm'
import { sociosForm } from '../Forms/sociosForm'
import Crumbs from '../Reusable Components/Crumbs'

import StepperButtons from '../Reusable Components/StepperButtons'
import CustomStepper from '../Reusable Components/Stepper'
import AlertDialog from '../Reusable Components/AlertDialog'
import { removeFile as globalRemoveFile, sizeExceedsLimit } from '../Utils/handleFiles'

class EmpresasContainer extends Component {

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
        razaoSocial: '',
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
        document.addEventListener('keydown', this.escFunction, false)
        document.querySelector("input[name='razaoSocial']").style.width = '300px'
    }

    componentWillUnmount() { this.setState({}) }

    setActiveStep = async action => {

        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })

        const { errors } = this.state
        if (errors && errors[0]) {
            await this.setState({ ...this.state, ...checkInputErrors('setState') })
            return
        }
    }

    handleInput = e => {
        const
            { name, value } = e.target,
            parsedValue = valueParser(name, value)

        this.setState({ [name]: parsedValue })
    }

    addSocio = async () => {
        let socios = this.state.socios,
            sObject = {},
            invalid = 0,
            totalShare = 0

        sociosForm.forEach(obj => {
            if (this.state[obj.field] === '' || this.state[obj.field] === undefined) {
                invalid += 1
            }
        })

        if (invalid === 100) {
            this.setState({ alertType: 'fieldsMissing', openAlertDialog: true })
            return null
        } else {
            sociosForm.forEach(obj => {
                Object.assign(sObject, { [obj.field]: this.state[obj.field] })
            })
            socios.push(sObject)

            socios.forEach(s => {
                totalShare += Number(s.share)
            })
            if (totalShare > 100) {
                socios.pop()
                this.setState({ alertType: 'overShared', openAlertDialog: true })
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
        const { name } = e.target, { socios } = this.state

        let { value } = e.target
        if (name === 'share') value = value.replace(',', '.')

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

    handleBlur = async e => {
        const { empresas } = this.props.redux
        const { name } = e.target
        let { value } = e.target

        const errors = checkInputErrors()
        if (errors) this.setState({ errors })
        else this.setState({ errors: undefined })

        switch (name) {
            case 'cnpj':
                const alreadyExists = empresas.filter(e => e.cnpj === value)
                if (alreadyExists[0]) {
                    this.setState({ cnpj: '' })
                    this.setState({ alertType: alreadyExists[0], openAlertDialog: true })
                }
                break;
            case 'share':
                value = value.replace(',', '.')
                if (value > 100) {
                    this.setState({ alertType: 'overShared', openAlertDialog: true })
                }
                else {
                    const totalShare = Number(this.state.totalShare) + Number(value)
                    this.setState({ [name]: value, totalShare })
                }
                break;
            case 'numero':
                if (value && !value.match(/^\d+$/)) {
                    await this.setState({ numero: '' })
                    this.setState({ alertType: 'numberNotValid', openAlertDialog: true })
                }
                break;
            default:
                break;
        }
    }

    handleFiles = files => {
        //limit file Size
        if (sizeExceedsLimit(files)) return

        let formData = new FormData()
        formData.append('contratoSocial', files[0])
        this.setState({ contratoSocial: formData })
    }

    handleSubmit = async () => {

        let { socios, contratoSocial } = this.state,
            empresa = {},
            empresaId,
            socioIds

        empresasForm.forEach(e => {
            if (this.state.hasOwnProperty([e.field])) {
                Object.assign(empresa, { [e.field]: this.state[e.field] })
            }
        })

        empresa.situacao = 'Ativo'

        Object.entries(empresa).forEach(([k, v]) => {
            if (!v || v === '') delete empresa[k]
        })

        socios.forEach(s => {
            delete s.edit
            Object.entries(s).forEach(([k, v]) => {
                if (!v || v === '') delete socios[k]
            })
        })

        empresa = humps.decamelizeKeys(empresa)
        socios = humps.decamelizeKeys(socios)

        await axios.post('/api/empresaFullCad', { empresa, socios })
            .then(res => {
                empresaId = res.data.codigo_empresa
                socioIds = res.data.socioIds
            })

        this.submitFile(empresaId, socioIds, contratoSocial)
        this.toast()
        this.resetState()
    }

    submitFile = async (empresaId, socioIds, contratoSocial) => {
        if (contratoSocial instanceof FormData) {
            const contratoFile = new FormData()
            let metadata = {
                fieldName: 'contratoSocial',
                empresaId,
                socios: socioIds,
                tempFile: false
            }

            metadata = JSON.stringify(metadata)
            contratoFile.append('metadata', metadata)

            for (let pair of contratoSocial.entries()) {
                contratoFile.append(pair[0], pair[1])
            }

            await axios.post('/api/empresaUpload', contratoFile)
                .then(r => console.log('file ok.'))
        }
    }

    removeFile = async (name) => {
        const
            { contratoSocial } = this.state,
            newState = globalRemoveFile(name, contratoSocial)
        this.setState({ ...this.state, ...newState })
    }

    resetState = () => {
        let
            resetEmpresa = {},
            resetSocios = {},
            resetFiles = {}

        empresasForm.forEach(obj => {
            Object.keys(obj).forEach(key => {
                if (key === 'field' && this.state[obj[key]]) Object.assign(resetEmpresa, { [obj[key]]: undefined })
            })
        })

        sociosForm.forEach(obj => {
            Object.keys(obj).forEach(key => {
                if (key === 'field' && this.state[obj[key]]) Object.assign(resetSocios, { [obj[key]]: undefined })
            })
        })

        empresaFiles.forEach(({ name }) => {
            Object.assign(resetFiles, { [name]: undefined })
        })

        this.setState({
            ...resetEmpresa,
            ...resetSocios,
            ...resetFiles,
            activeStep: 0,
            razaoSocial: '',
            files: [],
            fileNames: [],
            addedSocios: [0],
            totalShare: 0,
            socios: [],
            dropDisplay: 'Clique ou arraste para anexar o contrato social atualizado da empresa',
            showFiles: false
        })
    }
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })
    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    showFiles = () => this.setState({ showFiles: true })
    closeFiles = () => this.setState({ showFiles: !this.state.showFiles })

    render() {

        const { socios, activeStep, confirmToast, toastMsg, steps, openAlertDialog,
            alertType, contratoSocial } = this.state

        return <Fragment>

            <Crumbs links={['Empresas', '/empresas']} text='Cadastro de empresas' />

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
                        removeFile={this.removeFile}
                    />
                    : activeStep === 1 ?
                        <SociosTemplate
                            data={this.state}
                            socios={socios}
                            handleInput={this.handleInput}
                            handleBlur={this.handleBlur}
                            addSocio={this.addSocio}
                            removeSocio={this.removeSocio}
                            handleFiles={this.handleFiles}
                            enableEdit={this.enableEdit}
                            handleEdit={this.handleEdit}
                        />
                        :
                        activeStep === 2 &&
                        <EmpresaCadReview
                            data={this.state}
                            files={contratoSocial}
                            filesForm={empresaFiles}
                            empresasForm={empresasForm}
                            sociosForm={sociosForm}
                        />
            }
            <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                handleSubmit={this.handleSubmit}
                setActiveStep={this.setActiveStep}
            />
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customMessage={this.state.customMsg} />}
        </Fragment>
    }
}

const collections = ['empresas']

export default (StoreHOC(collections, EmpresasContainer))