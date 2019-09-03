import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'
import VeiculosTemplate from './VeiculosTemplate'
import CadVehicle from './CadVehicle'
import { TabMenu } from '../Layouts'
import { vehicleForm } from '../Forms/vehicleForm'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
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
        files: []
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

    handleFiles = async e => {
        const { name, files } = e.target
        if (files && files[0]) {
            this.setState({ [name]: files[0].name })

            let formData = new FormData()
            //formData.append('id', name)
            let f = this.state.files

            if (files && files.length > 0) {
                f.push({ [name]: files[0] })
                await this.setState({ files: f })

                cadVehicleFiles.forEach(({ name }) => {
                    for (let keys in this.state) {
                        if (keys.match(name)) {
                            //console.log(name)
                            const file = this.state.files.filter(el => Object.keys(el)[0] === name)[0]
                            formData.append('id', name)
                            formData.append(name, file[name])
                        }
                        else void 0
                    }
                })
                this.setState({ form: formData })
            }
            /* for (var pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1], 'ASDKJAHSD'); } */
        }
        //console.log(this.state.files)
    }

    handleSubmit = e => {
        const { form } = this.state
        //for (var pair of form.entries()) console.log(pair[0] + ', ' + pair[1], 'ASDKJAHSD')
        
        axios.post('/api/upload', form)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
    }

    render() {
        const { tab, items, selectedEmpresa, confirmToast, msg, activeStep } = this.state
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
                    data={this.state}
                    handleFiles={this.handleFiles}
                    handleSubmit={this.handleSubmit}
                />
            }
            <ReactToast open={confirmToast} close={this.toast} msg={msg} />
        </Fragment>
    }
}