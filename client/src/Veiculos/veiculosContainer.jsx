import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'
import VeiculosTemplate from './VeiculosTemplate'
import CadVehicle from './CadVehicle'
import { TabMenu } from '../Layouts'
import { vehicleForm } from '../Forms/vehicleForm'
import CustomStepper from '../Utils/Stepper'


export default class extends Component {

    state = {
        tab: 0,
        items: ['Cadastro de Veículo', 'Atualização de Seguro',
            'Alteração de dados', 'Baixa de Veículo'],
        empresas: [],
        selectedEmpresa: '',
        razaoSocial: '',
        frota: [],
        msg: 'Veículo cadastrado!',
        confirmToast: false,
        activeStep: 0,
        fileName: ''
    }

    async componentDidMount() {
        const { tab } = this.state
        await axios.get('/api/empresas')
            .then(res => {
                const empresas = humps.camelizeKeys(res.data)
                this.setState({ empresas })
            })
        let form = {}
        vehicleForm[tab].forEach(e => {
            const keys = humps.decamelize(e.field)
            Object.assign(form, { [keys]: '' })
            this.setState({ [e.field]: '', form })
        })

    }

    changeTab = (e, value) => {
        const opt = ['Veículo cadastrado!', 'Seguro atualizado!', 'Dados Alterados!', 'Veículo Baixado.']
        this.setState({ tab: value, msg: opt[value] })
    }

    handleInput = e => {
        const { name, value } = e.target
        const parsedName = humps.decamelize(name)
        if (name !== 'razaoSocial') this.setState({ [name]: value, form: { ...this.state.form, [parsedName]: value } })
        else this.setState({ [name]: value })
    }

    handleBlur = async  e => {
        const { empresas } = this.state
        const { value, name } = e.target

        const selectedEmpresa = empresas.filter(e => e.razaoSocial.toLowerCase().match(value.toLowerCase()))[0]

        if (name === 'razaoSocial' && selectedEmpresa) {
            await this.setState({ selectedEmpresa, [name]: selectedEmpresa.razaoSocial, oldId: selectedEmpresa.oldId })
            await axios.get(`/api/veiculos?id=${selectedEmpresa.delegatarioId}`)
                .then(res => this.setState({ frota: humps.camelizeKeys(res.data) }))
        }
        if (name === 'placa') {
            const vehicle = this.state.frota.filter(v => v.placa === value)[0]
            await this.setState({ ...vehicle })
        }
    }

    handleCadBlur = async  e => {
        const { empresas } = this.state
        const { value, name } = e.target

        const selectedEmpresa = empresas.filter(e => e.razaoSocial.toLowerCase().match(value.toLowerCase()))[0]
        if (selectedEmpresa) {
            await this.setState({ selectedEmpresa, [name]: selectedEmpresa.razaoSocial })
            axios.get(`/api/veiculos?id=${selectedEmpresa.delegatarioId}`)
                .then(res => this.setState({ frota: humps.camelizeKeys(res.data) }))
        }
    }

    handleCadastro = async e => {

        const { form } = this.state
        await axios.post('/api/cadastroVeiculo', form)
            .then(res => console.log(res.data))
        this.toast()
    }

    toast = e => {
        this.setState({ confirmToast: !this.state.confirmToast })
    }
    setActiveStep = action => {
        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 });
    }

    handleFiles = e => {
        const { files } = e.target
        if (files && files.length > 0) this.setState({ fileName: files[0].name })
    }

    render() {
        const { tab, items, selectedEmpresa, confirmToast, msg, activeStep, fileName } = this.state
        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <CustomStepper
                activeStep={activeStep}
                setActiveStep={this.setActiveStep}
            />
            {tab === 5 ? <VeiculosTemplate
                data={this.state}
                selectedEmpresa={selectedEmpresa}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleCadastro={() => this.handleCadastro}
                setActiveStep={this.setActiveStep}
            />
                :
                <CadVehicle
                    handleFiles={this.handleFiles}
                    fileName={fileName}
                />
            }
            <ReactToast open={confirmToast} close={this.toast} msg={msg} />
        </Fragment>
    }
}