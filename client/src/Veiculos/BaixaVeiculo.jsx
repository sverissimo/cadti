import React, { Component, Fragment } from 'react'
import { ReactContext } from '../Store/ReactContext'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import BaixaTemplate from './BaixaTemplate'
import AlertDialog from '../Reusable Components/AlertDialog'
import ReactToast from '../Reusable Components/ReactToast'

import { logGenerator } from '../Utils/logGenerator'
import { baixaForm } from '../Forms/baixaForm'
import { checkDemand } from '../Utils/checkDemand'

import './veiculos.scss'


class BaixaVeiculo extends Component {

    static contextType = ReactContext

    state = {
        empresas: [],
        razaoSocial: this.props.redux.empresas[0].razaoSocial,
        frota: [],
        placa: '',
        form: {},
        check: '',
        delegaTransf: '',
        toastMsg: 'Solicitação de Baixa Enviada',
        confirmToast: false,
        openDialog: false,
        selectedEmpresa: this.props.redux.empresas[0]
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
    selectOption = e => this.setState({ selectedOption: e.target.value })
    selectMotivo = e => this.setState({ selectedMotivo: e.target.value })

    handleInput = async e => {
        const
            { name, value } = e.target,
            { veiculos, empresas } = this.props.redux
        console.log("🚀 ~ file: BaixaVeiculo.jsx ~ line 57 ~ BaixaVeiculo ~ name, value", name, value)

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
            { empresas, logs } = this.props.redux,
            { frota, demand } = this.state,
            { name } = e.target
        let { value } = e.target

        if (name === 'delegaTransf') {
            if (value.length > 0) {
                const delegaTransf = empresas.find(e => e.razaoSocial === value)
                if (delegaTransf) {
                    const { razaoSocial, codigoEmpresa } = delegaTransf
                    await this.setState(
                        {
                            delegaTransf: razaoSocial,
                            delegaTransfId: codigoEmpresa,
                            disableSubmit: true
                        }
                    )
                    console.log(this.state)
                    void 0
                } else this.setState({ openAlertDialog: true, alertType: 'empresaNotFound', delegaTransf: '' })
            }
        }

        if (name === 'placa' && typeof frota !== 'string') {
            if (!value || value === '') this.setState({ disableSubmit: true })

            let vehicle
            if (value.length > 2)
                vehicle = frota.find(v => {
                    if (typeof value === 'string') return v.placa.toLowerCase().match(value.toLowerCase())
                    else return v.placa.match(value)
                })

            if (vehicle) {
                if (!demand) {
                    const
                        customTitle = 'Solicitação já cadastrada',
                        customMessage = `Já existe uma demanda aberta para o veículo de placa ${vehicle.placa}. Para acessá-la, clique em "Solicitações" no menu superior.`

                    const demandExists = checkDemand(vehicle?.veiculoId, logs)

                    if (demandExists) {
                        this.setState({ customTitle, customMessage, openAlertDialog: true, delegatario: '', placa: undefined })
                        return
                    }
                }
                await this.setState({ ...vehicle })

            } else if (this.state.placa !== '') {
                let reset = {}
                if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
                this.setState({ alertType: 'plateNotFound', openAlertDialog: true, disableSubmit: true })
                this.setState({ ...reset })
            }
        }
    }

    handleSubmit = async () => {

        const
            { selectedEmpresa, checked, veiculoId, justificativa, pendencias, delegaTransf, delegaTransfId, demand } = this.state,
            oldHistoryLength = demand?.history?.length || 0,
            demandHistory = demand?.history.some(el => el.hasOwnProperty('delegaTransfId'))
        let
            tempObj,
            enableSubmit,
            log = {},
            logSubject,
            info,
            history,
            historyTransfId,
            checkArray = ['selectedEmpresa', 'placa', 'codigoEmpresa']

        if (demand && demandHistory && Array.isArray(demandHistory))
            historyTransfId = demandHistory.reverse().find(e => e.hasOwnProperty('delegaTransfId')).delegaTransfId

        switch (checked) {
            case ('venda'):
                checkArray.push('delegaTransf')

                logSubject = `Baixa de veículo - venda para ${delegaTransf}`
                info = `Solicitação de transferência do veículo para ${delegaTransf}`
                history = { action: 'Solicitação de baixa', info }

                if (!demand && delegaTransfId) history.delegaTransfId = delegaTransfId
                if (demand && delegaTransfId && delegaTransfId !== historyTransfId) history.delegaTransfId = delegaTransfId
                break

            case ('outro'):
                checkArray.push('justificativa')
                history = { action: 'Solicitação de baixa', info: justificativa }
                break

            case ('pendencias'):
                history = { action: 'Pendências para a baixa do veículo', info: pendencias }
                this.setState({ toastMsg: 'Pendências para baixa enviadas.' })
                break

            case ('aprovar'):
                tempObj = { situacao: 'Veículo baixado', apolice: 'Seguro não cadastrado' }
                history = { action: 'Baixa do veículo aprovada' }

                if (demand?.subject.match('venda')) {
                    const newEmpresaId = demand?.history[0]?.delegaTransfId
                    tempObj.codigoEmpresa = newEmpresaId
                    tempObj.situacao = 'Ativo'
                }
                break
            default: return
        }

        enableSubmit = checkArray.every(k => this.state.hasOwnProperty(k) && this.state[k] !== '')
        if (!enableSubmit) {
            await this.setState({ openAlertDialog: true, alertType: 'fieldsMissing' })
            return null
        }

        //**************Create Log****************** */
        log = {
            subject: logSubject,
            empresaId: selectedEmpresa?.codigoEmpresa,
            veiculoId,
            history,
            historyLength: oldHistoryLength
        }

        if (demand) log.id = demand?.id
        if (checked === 'aprovar') log.approved = true

        logGenerator(log).then(r => console.log(r.data))

        //*************If approved, submit request to update Postgres DB **************** */
        if (checked === 'aprovar') {
            const
                requestObject = humps.decamelizeKeys(tempObj),
                table = 'veiculos',
                tablePK = 'veiculo_id'

            await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
                .catch(err => console.log(err))
            this.setState({ toastMsg: 'Baixa realizada com sucesso.' })
        }

        //***********Clear state****************** */        
        this.toast()
        await this.setState({ selectedEmpresa: undefined, frota: [], razaoSocial: '' })
        this.reset()

        //***********if demand, Redirect to /solicitacoes */        
        if (demand)
            setTimeout(() => {
                this.props.history.push('/solicitacoes')
            }, 1500)
    }

    searchDischarged = async e => {
        e.preventDefault()
        const
            { placaBaixada } = this.state,
            query = await axios.get(`/api/getOldVehicles?placa=${placaBaixada}`),
            result = query?.data
        if (result[0])
            this.setState({ dischargedFound: result[0], notFound: false })
        else
            this.setState({ notFound: true, dischargedFound: undefined })
    }
    handleCheck = e => this.setState({ checked: e.target.value })
    reset = () => {
        baixaForm.forEach(el => this.setState({ [el.field]: '' }))
        this.setState({ delegaTransf: '', check: '', justificativa: '', checked: false, demand: undefined })
    }
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const
            { empresas, parametros } = this.props.redux,
            { motivosBaixa } = parametros[0],
            { delegaTransf, confirmToast, toastMsg, checked, openAlertDialog, customTitle, customMessage, alertType } = this.state

        return <Fragment>
            <BaixaTemplate
                data={this.state}
                empresas={empresas}
                motivosBaixa={motivosBaixa}
                checked={checked}
                selectOption={this.selectOption}
                selectMotivo={this.selectMotivo}
                delegaTransf={delegaTransf}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleCheck={this.handleCheck}
                handleSubmit={this.handleSubmit}
                searchDischarged={this.searchDischarged}
            />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customTitle={customTitle} customMessage={customMessage} />}
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
        </Fragment >
    }
}

const collections = ['veiculos', 'empresas', 'parametros']

export default StoreHOC(collections, BaixaVeiculo)