import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import SociosTemplate from './SociosTemplate'
import ReactToast from '../Reusable Components/ReactToast'
import valueParser from '../Utils/valueParser'

import Crumbs from '../Reusable Components/Crumbs'
import AlertDialog from '../Reusable Components/AlertDialog'

class AltSocios extends Component {

    state = {
        razaoSocial: '',
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        openDialog: false,
        dialogTitle: '',
        addedSocios: [0],
        filteredSocios: [],
    }

    componentDidMount() {
        const
            { socios, empresas } = this.props.redux,
            originalSocios = JSON.parse(JSON.stringify(socios))

        if (empresas && empresas.length === 1)
            this.setState({ selectedEmpresa: empresas[0], razaoSocial: empresas[0]?.razaoSocial, filteredSocios: socios, originalSocios })
        else
            this.setState({ originalSocios })
    }

    handleInput = async e => {
        const
            { empresas, socios } = this.props.redux,
            { name } = e.target

        let { value } = e.target
        const parsedValue = valueParser(name, value)

        this.setState({ [name]: parsedValue })

        if (name === 'razaoSocial') {
            const
                selectedEmpresa = empresas.find(e => e.razaoSocial === value),
                filteredSocios = socios.filter(s => s.razaoSocial === value)

            if (filteredSocios.length > 0)
                this.setState({ filteredSocios, selectedEmpresa })
            else
                this.setState({ filteredSocios: [] })
            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial)
                    this.setState({ selectedEmpresa: undefined })
            }
            else
                this.setState({ selectedEmpresa: undefined })
        }
    }

    enableEdit = index => {
        const
            { filteredSocios } = this.state,
            editSocio = filteredSocios[index]
        //Se estava true, ao desligar o modo edição chama handleSubmit, qeu checa por modificações e salva
        if (editSocio.edit === true) {
            this.handleSubmit(index)
            editSocio.edit = false
            filteredSocios[index] = editSocio
        }
        else {
            filteredSocios.forEach(s => s.edit = false)
            filteredSocios[index].edit = true
        }
        this.setState({ filteredSocios })
    }

    handleEdit = e => {
        const { name } = e.target
        let { value } = e.target

        value = valueParser(name, value)

        let editSocio = this.state.filteredSocios.filter(s => s.edit === true)[0]
        const index = this.state.filteredSocios.indexOf(editSocio)

        editSocio[name] = value

        let fs = this.state.filteredSocios
        fs[index] = editSocio

        this.setState({ filteredSocios: fs })
    }

    handleSubmit = async index => {
        const { filteredSocios } = this.state

        const
            table = 'socios',
            keys = ['telSocio', 'emailSocio'],
            editSocio = filteredSocios[index]

        /* if (!editSocio?.telSocio && !editSocio?.emailSocio) {
            console.log(false)
            return
        }
        else if (editSocio.telSocio === originalSocio.telSocio && editSocio.emailSocio === originalSocio.emailSocio) {
            console.log(false)
            return
        } */

        const requestObject = { socioId: editSocio.socioId }
        keys.forEach(k => { if (editSocio[k]) requestObject[k] = editSocio[k] })
        const requestArray = [humps.decamelizeKeys(requestObject)]

        await axios.put('/api/editSocios', { requestArray, table, keys })
            .then(r => console.log(r.data))
            .catch(err => console.log(err))
    }

    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = toastMsg => this.setState({ confirmToast: !this.state.confirmToast, toastMsg: toastMsg ? toastMsg : this.state.toastMsg })
    render() {
        const
            { filteredSocios, openAlertDialog, alertType, confirmToast, toastMsg } = this.state,
            { empresas } = this.props.redux

        return (
            <React.Fragment>
                <Crumbs links={['Empresas', '/empresas']} text='Alteração do quadro societário' />
                <SociosTemplate
                    data={this.state}
                    socios={filteredSocios}
                    empresas={empresas}
                    handleInput={this.handleInput}
                    enableEdit={this.enableEdit}
                    handleEdit={this.handleEdit}
                    handleSubmit={this.handleSubmit}
                />
                <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} />}
            </React.Fragment>
        )
    }
}

const collections = ['empresas', 'socios', 'getFiles/empresaDocs']

export default StoreHOC(collections, AltSocios)