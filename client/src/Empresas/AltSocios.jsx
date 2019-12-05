import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'

import AltSociosTemplate from './AltSociosTemplate'
import { sociosForm } from '../Forms/sociosForm'

/* import ReactToast from '../Utils/ReactToast'
import AlertDialog from '../Utils/AlertDialog' */

export default class AltSocios extends Component {

    state = {
        empresas: [],
        razaoSocial: 'aa',
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        files: [],
        fileNames: [],
        openDialog: false,
        addedSocios: [0],
        totalShare: 0,
        filteredSocios: [],
        dropDisplay: 'Clique ou arraste para anexar o contrato social atualizado da empresa',
        showFiles: false,
    }

    componentDidMount() {
        const empresas = axios.get('/api/empresas'),
            socios = axios.get('/api/socios')

        Promise.all([empresas, socios])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([empresas, socios]) => this.setState({ empresas, socios, form: sociosForm }))
    }


    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {
        const { name } = e.target
        let { value } = e.target

        this.setState({ [name]: value })

        if (name === 'razaoSocial') {
            const filteredSocios = this.state.socios.filter(s => s.razaoSocial === value),
                selectedEmpresa = this.state.empresas.filter(e => e.razaoSocial === value)
            if (filteredSocios.length > 0) this.setState({ filteredSocios, selectedEmpresa })
        }
    }

    handleBlur = async  e => {
        const { empresas } = this.state
        const { name } = e.target
        let { value } = e.target

        console.log(empresas, name, value)
        /* switch (name) {
            case 'cnpj':
                const alreadyExists = empresas.filter(e => e.cnpj === value)
                if (alreadyExists[0]) {
                    this.setState({ cnpj: '' })
                    this.createAlert(alreadyExists[0])
                }
                break;
            case 'share':
                if (value > 100) {
                   console.log('overShared')
                }
                else {
                    const totalShare = Number(this.state.totalShare) + Number(value)
                    console.log(totalShare)
                }
                break;
            default:
                break;
        } */
    }

    addSocio = async () => {
        let socios = this.state.filteredSocios,
            form = sociosForm,
            sObject = {}

        form.forEach(obj => {
            Object.assign(sObject, { [obj.field]: this.state[obj.field] })
        })
        socios.push(sObject)
        console.log(socios)

        await this.setState({ filteredSocios: socios })

        sociosForm.forEach(obj => {
            this.setState({ [obj.field]: '' })
        })
        document.getElementsByName('nomeSocio')[0].focus()
    }

    removeSocio = index => {

        let socios = this.state.filteredSocios
        socios.splice(index, 1)
        this.setState({ filteredSocios: socios })
    }

    enableEdit = index => {

        let editSocio = this.state.filteredSocios
        if (editSocio[index].edit === true) editSocio[index].edit = false
        else {
            editSocio.forEach(s => s.edit = false)
            editSocio[index].edit = true
        }
        this.setState({ filteredSocios: editSocio })
    }


    handleEdit = e => {
        const { name, value } = e.target

        let editSocio = this.state.filteredSocios.filter(s => s.edit === true)[0]
        const index = this.state.filteredSocios.indexOf(editSocio)

        editSocio[name] = value

        let fs = this.state.filteredSocios
        fs[index] = editSocio

        this.setState({ filteredSocios: fs })
    }

    handleSubmit = e => {
        const { selectedEmpresa, socios } = this.state

        let submitSocios = this.state.filteredSocios

        let gotId, oldMembers = [], newMembers = []

        submitSocios.forEach(fs => {
            let { razaoSocial, dataInicio, dataFim, createdAt, edit, ...rest } = fs
            fs = rest
            fs.delegatarioId = selectedEmpresa[0].delegatarioId
            if (!fs.hasOwnProperty('socioId')) {
                gotId = socios.filter(s => s.cpfSocio === fs.cpfSocio)
                if (gotId.length > 0) {
                    fs.socioId = gotId[0].socioId
                    oldMembers.push(fs)
                } else {
                    newMembers.push(fs)
                }
            } else {                
                oldMembers.push(fs)
                delete oldMembers.socioId
            }
        })

        const requestArray = humps.decamelizeKeys(oldMembers),
            table = 'socios',
            tablePK = 'socio_id'
        axios.post('/api/editSocios', { requestArray, table, tablePK })
            .then(r => console.log(r.data))

        //console.log('old: ', oldMembers, 'new: ', newMembers)

        //console.log(submitSocios)
    }

    handleFiles = (file) => {

        let formData = new FormData()
        formData.append('contratoSocial', file[0])
        this.setState({ dropDisplay: file[0].name, contratoSocial: formData })
    }

    render() {

        return (
            <React.Fragment>
                <AltSociosTemplate
                    data={this.state}
                    handleInput={this.handleInput}
                    removeSocio={this.removeSocio}
                    handleFiles={this.handleFiles}
                    addSocio={this.addSocio}
                    enableEdit={this.enableEdit}
                    handleEdit={this.handleEdit}
                    handleSubmit={this.handleSubmit}
                />
            </React.Fragment>
        )
    }
}
