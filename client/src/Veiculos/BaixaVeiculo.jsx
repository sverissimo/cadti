import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import VehicleHOC from './VeiculosHOC'

import Crumbs from '../Utils/Crumbs'
import BaixaTemplate from './BaixaTemplate'
import AlertDialog from '../Utils/AlertDialog'
import ReactToast from '../Utils/ReactToast'


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
        openDialog: false
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

            } else this.setState({ selectedEmpresa: undefined, frota: [] })

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
        const { empresas, frota } = this.state
        const { name } = e.target
        let { value } = e.target

        switch (name) {
            case 'delegaTransf':
                await this.getId(name, value, empresas, 'delegatarioId', 'razaoSocial', 'delegatarioId', 'Empresa')
                break;
            default:
                void 0
        }
        if (name === 'placa' && typeof this.state.frota !== 'string') {

            let vehicle
            if (value.length > 2) {

                vehicle = this.state.frota.filter(v => {
                    if (typeof value === 'string') return v.placa.toLowerCase().match(value.toLowerCase())
                    else return v.placa.match(value)
                })[0]

                await this.setState({ ...vehicle, disable: true })

                if (vehicle !== undefined && vehicle.hasOwnProperty('empresa')) this.setState({ delegatario: vehicle.empresa })

            } else if (this.state.placa.length < 0 && !vehicle) {
                let reset = {}
                if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
                this.setState({ alertType: 'plateNotFound', openAlertDialog: true })
                this.setState({ ...reset, disable: false })
            }
        }
    }

    handleSubmit = async e => {
        const { delegatarioId,
            justificativa, checked, delegaTransf } = this.state

        const enableSubmit = ['placa', 'renavam', 'nChassi']
            .every(k => this.state.hasOwnProperty(k) && this.state[k] !== '')

        if (!enableSubmit) {
            this.setState({ alertType: 'fieldsMissing', openAlertDialog: true })
            return null
        }
        if (checked === 'venda' && !delegaTransf) {
            this.setState({ alertType: 'fieldsMissing', openAlertDialog: true })
            return null
        } if (checked === 'outro' && !justificativa) {
            this.setState({ alertType: 'fieldsMissing', openAlertDialog: true })
            return null
        } if (checked !== 'outro' && checked !== 'venda') {
            this.setState({ alertType: 'fieldsMissing', openAlertDialog: true })
            return null
        } if (this.state.placa.length <= 2) {
            this.setState({ alertType: 'invalidPlate', openAlertDialog: true })
            return null
        } else {
            let validPlate = []
            validPlate = this.state.frota.filter(v => v.placa === this.state.placa)
            if (validPlate.length < 1) {
                this.setState({ alertType: 'plateNotFound', openAlertDialog: true })
                return null
            }
        }

        let tempObj

        if (checked === 'venda') tempObj = { delegatarioId, situacao: 'pendente' }
        if (checked === 'outro') tempObj = { situacao: 'excluído' }

        const requestObject = humps.decamelizeKeys(tempObj)

        const table = 'veiculo',
            tablePK = 'veiculo_id'
        axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
            .then(() => this.toast())
            .catch(err => console.log(err))
    }

    handleCheck = e => this.setState({ checked: e.target.value })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { delegaTransf, confirmToast, toastMsg, checked, openAlertDialog,
            alertType } = this.state

        return <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Baixa de veículo' />
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

export default VehicleHOC(collections, BaixaVeiculo)