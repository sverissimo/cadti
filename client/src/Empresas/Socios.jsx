import React, { Component } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'

import SociosTemplate from './SociosTemplate'
import ReactToast from '../Reusable Components/ReactToast'
import valueParser from '../Utils/valueParser'

import Crumbs from '../Reusable Components/Crumbs'
import AlertDialog from '../Reusable Components/AlertDialog'
import { getCodigoEmpresaAndShare } from '../Utils/getEmpresasAndShare'

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
        const { socios, empresas } = this.props.redux
        const originalSocios = JSON.parse(JSON.stringify(socios))

        if (empresas && empresas.length === 1) {
            const filteredSocios = socios.map(s => getCodigoEmpresaAndShare(s, empresas[0]?.codigoEmpresa))
            this.setState({
                originalSocios,
                filteredSocios,
                selectedEmpresa: empresas[0],
                razaoSocial: empresas[0]?.razaoSocial,
            })
        }
        else
            this.setState({ originalSocios })
    }

    componentDidUpdate(prevProps) {
        if (prevProps && JSON.stringify(prevProps.redux.socios) !== JSON.stringify(this.props.redux.socios)) {
            const { selectedEmpresa } = this.state
            if (selectedEmpresa) {
                const { codigoEmpresa } = selectedEmpresa
                const { socios } = this.props.redux
                const filteredSocios = socios
                    .filter(s => s.empresas
                        && s.empresas[0]
                        && s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa)
                    )
                    .map(s => getCodigoEmpresaAndShare(s, codigoEmpresa))
                this.setState({ filteredSocios })
                this.toast()
            }
        }
    }

    handleInput = e => {
        const { empresas, socios } = this.props.redux
        const { name } = e.target
        let { value } = e.target

        const parsedValue = valueParser(name, value)
        this.setState({ [name]: parsedValue })

        if (name === 'razaoSocial') {
            const selectedEmpresa = empresas.find(e => e.razaoSocial === value)
            if (selectedEmpresa) {
                const { codigoEmpresa, razaoSocial } = selectedEmpresa
                const reduxSocios = JSON.parse(JSON.stringify(socios))
                const filteredSocios = reduxSocios
                    .filter(s => s.empresas
                        && s.empresas[0]
                        && s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa)
                    )
                    .map(socio => getCodigoEmpresaAndShare(socio, codigoEmpresa))

                this.setState({ razaoSocial, selectedEmpresa, filteredSocios })
            } else {
                this.setState({ selectedEmpresa: undefined, filteredSocios: [] })
            }
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
        const { filteredSocios, selectedEmpresa } = this.state
        const { codigoEmpresa } = selectedEmpresa
        const editSocio = filteredSocios[index]
        const { socioId, telSocio, emailSocio, empresas } = editSocio
        const socios = [{ socioId, telSocio, emailSocio, empresas }]

        axios.put('/api/socios', { socios, codigoEmpresa })
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
                <Crumbs links={['Empresas', '/empresas']} text='Alteração de dados dos sócios' />
                <SociosTemplate
                    data={this.state}
                    socios={filteredSocios}
                    empresas={empresas}
                    handleInput={this.handleInput}
                    enableEdit={this.enableEdit}
                    handleEdit={this.handleEdit}
                />
                <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} />}
            </React.Fragment>
        )
    }
}

const collections = ['empresas', 'socios', 'getFiles/empresaDocs']

export default StoreHOC(collections, AltSocios)