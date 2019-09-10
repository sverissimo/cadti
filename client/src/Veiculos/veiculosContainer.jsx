import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'
import VeiculosTemplate from './VeiculosTemplate'
import CadVehicle from './CadVehicle'
import Review from './Review'
import { TabMenu } from '../Layouts'
import { vehicleForm } from '../Forms/vehicleForm'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { cadForm } from '../Forms/cadForm'
import StepperButtons from './StepperButtons'
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
        files: [],
        fileNames: []
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
        if (name === 'placa' && typeof this.state.frota !== 'string') {

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
        const { selectedEmpresa } = this.state,
            { delegatarioId } = selectedEmpresa,
            situacao = 'Ativo'
        let review = {}

        cadForm.forEach(form => {
            form.forEach(obj => {
                for (let k in this.state) {
                    if (k.match(obj.field)) {
                        Object.assign(review, { [k]: this.state[k], delegatarioId, situacao })
                    }
                }
            })
        })
        const parsedReview = humps.decamelizeKeys(review)
        await axios.post('/api/cadastroVeiculo', parsedReview)
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
        if (action === 'reset') this.setState({ activeStep: 0 })
    }

    handleFiles = async e => {
        const { name, files } = e.target

        if (files && files[0]) {

            document.getElementById(name).value = files[0].name

            let formData = new FormData()

            let fn = this.state.fileNames

            if (files && files.length > 0) {

                fn.push({ [name]: files[0].name })
                await this.setState({ filesNames: fn, [name]: files[0] })

                cadVehicleFiles.forEach(({ name }) => {
                    for (let keys in this.state) {
                        if (keys.match(name)) {
                            formData.append('id', name)
                            formData.append(name, this.state[name])
                        }
                        else void 0
                    }
                })
                this.setState({ form: formData })
            }
        }
    }

    handleSubmit = async e => {
        const { form } = this.state
        //for (var pair of form.entries()) console.log(pair[0] + ', ' + pair[1], 'ASDKJAHSD')

        await axios.post('/api/upload', form)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
        this.toast()
    }

    render() {
        const { tab, items, selectedEmpresa, confirmToast, msg, activeStep } = this.state
        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            {tab === 0 && <CustomStepper
                activeStep={activeStep}
                setActiveStep={this.setActiveStep}
                selectedEmpresa={selectedEmpresa}
            />}
            {activeStep < 2 ? <VeiculosTemplate
                data={this.state}
                selectedEmpresa={selectedEmpresa}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
            />
                : tab === 0 && activeStep === 2 ?
                    <CadVehicle
                        data={this.state}
                        handleFiles={this.handleFiles}
                        handleSubmit={this.handleSubmit}
                        handleNames={this.handleNames}
                    />
                    : tab === 0 && activeStep === 3 ?
                        <Review data={this.state} />
                        : <Fragment></Fragment>
            }
            {tab === 0 && <StepperButtons
                activeStep={activeStep}
                handleCadastro={this.handleCadastro}
                setActiveStep={this.setActiveStep}
            />}
            <ReactToast open={confirmToast} close={this.toast} msg={msg} />
        </Fragment>
    }
}