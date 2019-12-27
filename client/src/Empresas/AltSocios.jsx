import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import Crumbs from '../Utils/Crumbs'
import AltSociosTemplate from './AltSociosTemplate'
import { sociosForm } from '../Forms/sociosForm'
import AlertDialog from '../Utils/AlertDialog'

//import AlertDialog from '../Utils/AlertDialog'

export default class AltSocios extends Component {

    state = {
        empresas: [],
        razaoSocial: '',
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        files: [],
        fileNames: [],
        openDialog: false,
        dialogTitle: '',
        addedSocios: [0],
        totalShare: 0,
        filteredSocios: [],
        dropDisplay: 'Clique ou arraste para anexar o contrato social atualizado da empresa',
        showFiles: false,
        selectedEmpresa: []
    }

    componentDidMount() {
        const empresas = axios.get('/api/empresas'),
            socios = axios.get('/api/socios')

        Promise.all([empresas, socios])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([empresas, socios]) => {
                this.setState({ empresas, socios, form: sociosForm, originalSocios: humps.decamelizeKeys(socios) });
            })
    }


    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {

        const { name } = e.target
        let { value } = e.target

        const { socios } = this.state

        this.setState({ ...this.state, [name]: value })

        if (name === 'razaoSocial') {
            const filteredSocios = socios.filter(s => s.razaoSocial === value),
                selectedEmpresa = this.state.empresas.filter(e => e.razaoSocial === value)
            if (filteredSocios.length > 0) {
                this.setState({ filteredSocios, selectedEmpresa })
            } else this.setState({ filteredSocios: [] })
            if (selectedEmpresa.length > 0) {
                await this.setState({ razaoSocial: selectedEmpresa[0].razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa[0].razaoSocial) this.setState({ selectedEmpresa: [] })
            } else this.setState({ selectedEmpresa: [] })
        }
    }

    handleBlur = e => {
        const { filteredSocios } = this.state
        const { name } = e.target
        let { value } = e.target
        switch (name) {
            case 'cpfSocio':
                const alreadyExists = filteredSocios.find(e => e.cpfSocio === value)
                if (alreadyExists) {
                    this.createAlert('alreadyExists')
                    this.setState({ cpfSocio: '' })
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
        }
    }

    addSocio = async () => {
        let socios = this.state.filteredSocios,
            form = sociosForm,
            sObject = {}

        form.forEach(obj => {
            Object.assign(sObject, { [obj.field]: this.state[obj.field] })
        })
        socios.push(sObject)

        await this.setState({ filteredSocios: socios })

        sociosForm.forEach(obj => {
            this.setState({ [obj.field]: '' })
        })
        document.getElementsByName('nomeSocio')[0].focus()
    }

    removeSocio = async index => {

        let socios = [...this.state.filteredSocios],
            allSocios = [...this.state.socios]
        const id = socios[index].socioId

        await axios.delete(`/api/delete?table=socios&tablePK=socio_id&id=${id}`)
            .catch(err => console.log(err))
        allSocios = allSocios.filter(s => s !== socios[index])
        socios.splice(index, 1)
        this.setState({ filteredSocios: socios, socios: allSocios })
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
        const { name, value } = e.target,
            { socios } = this.state

        let editSocio = this.state.filteredSocios.filter(s => s.edit === true)[0]
        const index = this.state.filteredSocios.indexOf(editSocio)

        editSocio[name] = value

        let fs = this.state.filteredSocios
        fs[index] = editSocio

        this.setState({ socios, filteredSocios: fs })

    }

    handleSubmit = async () => {
        const { selectedEmpresa, socios, contratoSocial } = this.state

        let submitSocios = this.state.filteredSocios,
            oldMembers = [], newMembers = [],
            contratoFile = new FormData(),
            keys = sociosForm.map(el => humps.decamelize(el.field))
        keys.splice(1, 1)

        submitSocios.forEach(fs => {
            let { razaoSocial, createdAt, edit, ...rest } = fs
            fs = rest
            fs.delegatarioId = selectedEmpresa[0].delegatarioId
            if (!fs.hasOwnProperty('socioId')) {
                const gotId = socios.find(s => s.cpfSocio === fs.cpfSocio)
                if (gotId) {
                    fs.socioId = gotId.socioId
                    oldMembers.push(fs)
                } else {
                    newMembers.push(fs)
                }
            } else {
                oldMembers.push(fs)
                delete oldMembers.socioId
            }
        })
        const table = 'socios', tablePK = 'socio_id'
        let realChanges = [], altObj = {}

        const originals = humps.camelizeKeys(this.state.originalSocios)

        oldMembers.forEach(m => {
            originals.forEach(s => {
                if (m.socioId === s.socioId) {
                    Object.keys(m).forEach(key => {
                        if (m[key] !== s[key] || key === 'socioId') {
                            Object.assign(altObj, { [key]: m[key] })
                        }
                    })
                    if (Object.keys(altObj).length > 1) realChanges.push(altObj)
                    altObj = {}
                }
            })
        })

        oldMembers = humps.decamelizeKeys(realChanges)
        newMembers = humps.decamelizeKeys(newMembers)

        try {
            if (oldMembers.length > 0) {
                await axios.put('/api/editSocios', { requestArray: oldMembers, table, tablePK, keys })
                    .then(r => console.log(r.data))
            }

            if (newMembers.length > 0) {
                await axios.post('/api/cadSocios', { socios: newMembers, table, tablePK })
                    .then(r => {
                        axios.get('/api/socios')
                            .then(s => humps.camelizeKeys(s.data))
                            .then(socios => {
                                const filteredSocios = socios.filter(s => s.razaoSocial === selectedEmpresa[0].razaoSocial)
                                if (filteredSocios.length > 0) this.setState({ filteredSocios, socios })
                            })
                        console.log(r.data)
                    })
            }

            if (contratoSocial) {
                contratoFile.append('empresaId', selectedEmpresa[0].delegatarioId)
                for (let pair of contratoSocial.entries()) {
                    contratoFile.append(pair[0], pair[1])
                }
                await axios.post('/api/empresaUpload', contratoFile)
                    .then(r => console.log(r.data))
            }
        } catch (err) {
            console.log(err)
        }

        this.toast()
    }

    handleFiles = (file) => {

        let formData = new FormData()
        formData.append('contratoSocial', file[0])
        this.setState({ dropDisplay: file[0].name, contratoSocial: formData })
    }

    createAlert = (alert) => {
        let dialogTitle, message

        switch (alert) {
            case 'alreadyExists':

                dialogTitle = 'CPF já cadastrado.'
                message = `O CPF informado corresponde a um sócio já cadastrado. 
                Para remover ou editar as informações dos sócios, utilize a respectiva opção abaixo.`
                break;
            /*        case 'overShared':
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
                       break; */
            default:
                break;
        }

        this.setState({ openDialog: true, dialogTitle, message })
    }

    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { openDialog, dialogTitle, message } = this.state
        return (
            <React.Fragment>
                <Crumbs links={['Empresas', '/empresasHome']} text='Alteração do quadro societário' />
                <AltSociosTemplate
                    data={this.state}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    removeSocio={this.removeSocio}
                    handleFiles={this.handleFiles}
                    addSocio={this.addSocio}
                    enableEdit={this.enableEdit}
                    handleEdit={this.handleEdit}
                    handleSubmit={this.handleSubmit}
                />
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
                <AlertDialog open={openDialog} close={this.toggleDialog} title={dialogTitle} message={message} />
            </React.Fragment>
        )
    }
}
