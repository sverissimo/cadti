import React, { Component, Fragment } from 'react'
import { ReactContext } from '../Store/ReactContext'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import BaixaTemplate from './BaixaTemplate'
import AlertDialog from '../Utils/AlertDialog'
import ReactToast from '../Utils/ReactToast'

import { logGenerator } from '../Utils/logGenerator'
import { baixaForm } from '../Forms/baixaForm'

import './veiculos.css'

class BaixaVeiculo extends Component {

    static contextType = ReactContext

    state = {
        empresas: [],
        razaoSocial: '',
        frota: [],
        placa: '',
        form: {},
        check: '',
        delegaTransf: '',
        toastMsg: 'Baixa realizada com sucesso!',
        confirmToast: false,
        openDialog: false,
    }

    async componentDidMount() {

        const demand = this.props?.location?.state?.demand
        if (demand) {
            const
                { empresas, veiculos } = this.props.redux,
                { empresa, veiculo } = demand,
                selectedEmpresa = empresas.find(e => e.razaoSocial === empresa),
                frota = veiculos.filter(v => v.placa === veiculo),
                selectedVehicle = frota.find(v => v.placa === veiculo)

            await this.setState({ razaoSocial: empresa, selectedEmpresa, placa: veiculo, frota, ...selectedVehicle, demand })
        }
    }

    handleInput = async e => {
        const
            { name, value } = e.target,
            { veiculos, empresas } = this.props.redux

        this.setState({ [name]: value })

        if (name === 'razaoSocial') {
            let selectedEmpresa = empresas.find(e => e.razaoSocial === value)

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

    handleBlur = async e => {
        const
            { empresas } = this.props.redux,
            { frota } = this.state,
            { name } = e.target
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

        if (name === 'placa' && typeof frota !== 'string') {
            if (value === '') this.setState({ disableSubmit: true })
            if (value.length > 0) {
                let vehicle
                if (value.length > 2) vehicle = frota.find(v => {
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

        const { checked, delegatarioId, selectedEmpresa, veiculoId, justificativa, pendencias, delegaTransf, demand } = this.state
        let
            tempObj,
            enableSubmit,
            logSubject,
            obs,
            history,
            checkArray = ['selectedEmpresa', 'placa', 'delegatarioId']

        switch (checked) {
            case ('venda'):
                checkArray.push('delegaTransf')
                tempObj = { situacao: 'Aguardando aprovação de transferência' }                
                obs = `Solicitação de transferência do veículo para ${delegaTransf}`
                history = { action: 'Solicitação de baixa', info: obs }
                logSubject = `Baixa - venda de veículo para ${delegaTransf}`
                break

            case ('outro'):
                checkArray.push('justificativa')
                tempObj = { situacao: 'Aguardando aprovação de baixa' }                
                history = { action: 'Solicitação de baixa', info: justificativa }
                break

            case ('pendencias'):
                tempObj = { situacao: 'Pendências para a baixa do veículo' }
                history = { action: 'Pendências para a baixa do veículo', info: pendencias }
                break

            case ('aprovar'):
                tempObj = { situacao: 'Veículo baixado' }
                history = { action: 'Baixa do veículo aprovada' }
                break

            default: return
        }


        enableSubmit = checkArray.every(k => this.state.hasOwnProperty(k) && this.state[k] !== '')
        if (!enableSubmit) {
            await this.setState({ openAlertDialog: true, alertType: 'fieldsMissing' })
            return null
        }


//*******************FIX DELEGATARIOID SWITCH!!!!!!!!!!!!!!!!!! AND SEGURO NAO CADASTRADO ONLY AT CHECKED === APROVAR!!!!!!!!!!!!!!!!!!!!!!!!! */





        tempObj.apolice = 'Seguro não cadastrado'
        if (checked === 'aprovar' && demand.subject.match('venda de veículo')) tempObj.delegatarioId = delegatarioId

        const
            requestObject = humps.decamelizeKeys(tempObj),
            table = 'veiculo',
            tablePK = 'veiculo_id'

        await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
            .then(() => this.toast())
            .catch(err => console.log(err))

        //**************Create Log****************** */
        let log = {
            subject: logSubject,
            empresaId: selectedEmpresa.delegatarioId,
            veiculoId,
            status: tempObj.situacao,
            history
        }

        if (demand) log.id = demand?.id
        if (checked === 'aprovar') log.completed = true

        logGenerator(log).then(r => console.log(r.data))

        //***********Clear state****************** */        
        await this.setState({ selectedEmpresa: undefined, frota: [], razaoSocial: '' })
        this.reset()

        //***********if demand, Redirect to /solicitacoes */
        if (demand) this.props.history.push('/solicitacoes')
    }

    handleCheck = e => this.setState({ checked: e.target.value })
    reset = () => {
        baixaForm.forEach(el => this.setState({ [el.field]: '' }))
        this.setState({ delegaTransf: '', check: '', justificativa: '', checked: false, demand: undefined })
    }
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { delegaTransf, confirmToast, toastMsg, checked, openAlertDialog,
            alertType } = this.state

        return <Fragment>
            <BaixaTemplate
                data={this.state}
                empresas={this.props.redux.empresas}
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