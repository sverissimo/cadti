import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import BaixaTemplate from './BaixaTemplate'
import AlertDialog from '../Utils/AlertDialog'
import ReactToast from '../Utils/ReactToast'

import { baixaForm } from '../Forms/baixaForm'

import './veiculos.css'

class BaixaVeiculo extends Component {

    state = {
        empresas: [],
        razaoSocial: '',
        delegatarioCompartilhado: '',
        frota: [],
        placa: '',
        form: {},
        check: '',
        delegaTransf: '',
        toastMsg: 'Baixa realizada com sucesso!',
        confirmToast: false,
        openDialog: false,
    }

    componentDidMount() {
        this.setState({ ...this.props.redux })
    }
    
    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {
        const { name, value } = e.target,
            { veiculos } = this.state

        this.setState({ [name]: value })

        if (name === 'razaoSocial') {
            let selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)
                this.setState({ frota })

            } else {
                await this.setState({ selectedEmpresa: undefined, frota: [] })
                this.reset()
            }
        }
    }

    handleBlur = async  e => {
        const { empresas, frota } = this.state
        const { name } = e.target
        let { value } = e.target

        if (name === 'delegaTransf') {
            if (value.length > 0) {
                const newDelega = empresas.find(e => e.razaoSocial === value)
                if (newDelega) {
                    await this.setState({ delegatarioId: newDelega.delegatarioId, delegaTransf: newDelega.razaoSocial, disableSubmit: true })
                    void 0
                } else this.setState({ openAlertDialog: true, alertType: 'empresaNotFound', delegaTransf: '' })
            }
        }

        if (name === 'placa' && typeof this.state.frota !== 'string') {
            if (value === '') this.setState({ disableSubmit: true })
            if (value.length > 0) {
                let vehicle
                if (value.length > 2) vehicle = this.state.frota.find(v => {
                    if (typeof value === 'string') return v.placa.toLowerCase().match(value.toLowerCase())
                    else return v.placa.match(value)
                })

                await this.setState({ ...vehicle })

                if (!vehicle) {
                    let reset = {}
                    if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
                    this.setState({ alertType: 'plateNotFound', openAlertDialog: true, disableSubmit: true })
                    this.setState({ ...reset })
                }
            }
        }
    }

    handleSubmit = async () => {

        const { checked, delegatarioId } = this.state

        let checkArray = ['selectedEmpresa', 'placa', 'delegatarioId']
        let tempObj, enableSubmit

        if (checked === 'venda') {
            checkArray.push('delegaTransf')
            enableSubmit = checkArray.every(k => this.state.hasOwnProperty(k) && this.state[k] !== '')
            tempObj = { delegatarioId, situacao: 'pendente' }
        }
        if (checked === 'outro') {
            checkArray.push('justificativa')
            enableSubmit = checkArray.every(k => this.state.hasOwnProperty(k) && this.state[k] !== '')
            tempObj = { situacao: 'excluído' }
        }
        if (!enableSubmit) {
            await this.setState({ openAlertDialog: true, alertType: 'fieldsMissing' })
            return null
        }

        const requestObject = humps.decamelizeKeys(tempObj)

        const table = 'veiculo',
            tablePK = 'veiculo_id'
        axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
            .then(() => this.toast())
            .catch(err => console.log(err))
    }

    handleCheck = e => this.setState({ checked: e.target.value })
    reset = () => baixaForm.forEach(el => this.setState({ [el.field]: '' }))
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { delegaTransf, confirmToast, toastMsg, checked, openAlertDialog,
            alertType } = this.state
        console.log(this.props)
        return <Fragment>
            <BaixaTemplate
                data={this.state}
                checked={checked}
                delegaTransf={delegaTransf}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleCheck={this.handleCheck}
                handleSubmit={this.handleSubmit}
            />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} />}
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
        </Fragment >
    }
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, BaixaVeiculo)