import React, { Component } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'

import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import Crumbs from '../Utils/Crumbs'
import AltSociosTemplate from './AltSociosTemplate'
import { sociosForm } from '../Forms/sociosForm'
import AlertDialog from '../Utils/AlertDialog'

class AltSocios extends Component {

    state = {
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
        showFiles: false
    }

    componentDidMount() {
        const originals = humps.decamelizeKeys(this.props.redux.socios)
        this.setState({ originals })
    }

    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {
        const
            { empresas, socios } = this.props.redux,
            { name } = e.target
        let
            { value } = e.target

        this.setState({ ...this.state, [name]: value })

        if (name === 'razaoSocial') {
            const filteredSocios = [...socios.filter(s => s.razaoSocial === value)],
                selectedEmpresa = empresas.find(e => e.razaoSocial === value)
            if (filteredSocios.length > 0) {
                this.setState({ filteredSocios, selectedEmpresa })
            } else this.setState({ filteredSocios: [] })
            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })
            } else this.setState({ selectedEmpresa: undefined })
        }
    }

    handleBlur = async e => {
        const { filteredSocios } = this.state
        const { name } = e.target
        let { value } = e.target
        switch (name) {
            case 'cpfSocio':
                const alreadyExists = filteredSocios.find(e => e.cpfSocio === value)
                if (alreadyExists) {
                    this.setState({ alertType: 'alreadyExists', openAlertDialog: true })
                    this.setState({ cpfSocio: '' })
                }
                break;
            case 'share':

                if (value) {
                    value = value.replace(',', '.')

                    if (value > 100) {
                        await this.setState({ share: '' })
                        value = ''
                        this.setState({ alertType: 'numberNotValid', openAlertDialog: true })
                    }
                    if (value !== '0' && value !== '00' && !Number(value)) {

                        await this.setState({ share: '' })
                        this.setState({ alertType: 'numberNotValid', openAlertDialog: true })

                    } else {
                        let totalShare = filteredSocios.map(s => Number(s.share))
                            .reduce((a, b) => a + b)

                        totalShare += Number(value)
                        this.setState({ totalShare, share: value })
                    }
                }
                break;
            default:
                break;
        }
    }

    addSocio = async () => {
        let socios = this.state.filteredSocios,
            sObject = {}

        //check if totalShare is more than 100
        if (this.state.totalShare > 100) {
            this.setState({ openAlertDialog: true, alertType: 'overShared' })
            return null
        }

        sociosForm.forEach(obj => {
            Object.assign(sObject, { [obj.field]: this.state[obj.field] })
        })
        socios.unshift(sObject)

        await this.setState({ filteredSocios: socios })

        sociosForm.forEach(obj => {
            this.setState({ [obj.field]: '' })
        })
        document.getElementsByName('nomeSocio')[0].focus()
    }

    removeSocio = async index => {

        let socios = [...this.state.filteredSocios]
        const
            id = socios[index].socioId,
            originalSocios = this.props.redux.socios,
            registered = originalSocios.find(s => s.socioId === id)

        if (registered) {
            await axios.delete(`/api/delete?table=socios&tablePK=socio_id&id=${id}`)
                .catch(err => console.log(err))
        }

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
        const { name } = e.target
        let { value } = e.target

        if (name === 'share') value = value.replace(',', '.')
        let editSocio = this.state.filteredSocios.filter(s => s.edit === true)[0]
        const index = this.state.filteredSocios.indexOf(editSocio)

        editSocio[name] = value

        let fs = this.state.filteredSocios
        fs[index] = editSocio

        this.setState({ filteredSocios: fs })

    }

    handleSubmit = async () => {
        const
            { selectedEmpresa, contratoSocial, filteredSocios } = this.state,
            { socios } = this.props.redux

        //check if totalShare is more than 100
        let updatedShare = filteredSocios.map(s => Number(s.share))
            .reduce((a, b) => a + b)

        if (updatedShare > 100) {
            this.setState({ openAlertDialog: true, alertType: 'overShared' })
            return null
        }

        let
            oldMembers = [], newMembers = [],
            contratoFile = new FormData(),
            keys = sociosForm.map(el => humps.decamelize(el.field))
        keys.splice(1, 1)

        filteredSocios.forEach(fs => {
            let { razaoSocial, createdAt, edit, ...rest } = fs
            fs = rest
            fs.delegatarioId = selectedEmpresa.delegatarioId
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

        const originals = humps.camelizeKeys(this.state.originals)

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
            }

            if (contratoSocial) {
                contratoFile.append('empresaId', selectedEmpresa.delegatarioId)
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
        this.setState({ razaoSocial: '', selectedEmpresa: undefined, filteredSocios: [] })
    }

    handleFiles = (file) => {

        let formData = new FormData()
        formData.append('contratoSocial', file[0])
        this.setState({ dropDisplay: file[0].name, contratoSocial: formData })
    }

    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })


    render() {
        const { openAlertDialog, alertType } = this.state,
            { empresas } = this.props.redux

        return (
            <React.Fragment>
                <Crumbs links={['Empresas', '/empresasHome']} text='Alteração do quadro societário' />
                <AltSociosTemplate
                    data={this.state}
                    empresas={empresas}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    addSocio={this.addSocio}
                    removeSocio={this.removeSocio}
                    enableEdit={this.enableEdit}
                    handleEdit={this.handleEdit}
                    handleFiles={this.handleFiles}
                    handleSubmit={this.handleSubmit}
                />
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} />}
            </React.Fragment>
        )
    }
}

const collections = ['empresas', 'socios']

export default StoreHOC(collections, AltSocios)