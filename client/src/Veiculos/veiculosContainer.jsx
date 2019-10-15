import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import VeiculosTemplate from './VeiculosTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './Review'
import AltSeguro from './AltSeguro'
import AltDados from './AltDados'
import BaixaVeiculo from './BaixaVeiculo'

import StepperButtons from '../Utils/StepperButtons'
import CustomStepper from '../Utils/Stepper'


import { TabMenu } from '../Layouts'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { cadForm } from '../Forms/cadForm'

import AlertDialog from '../Utils/AlertDialog'

export default class extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.addEquipa) this.handleEquipa()
            }
        }
    }

    state = {
        tab: 0,
        items: ['Cadastro de Veículo', 'Atualização de Seguro',
            'Alteração de dados', 'Baixa de Veículo'],
        stepTitles: ['Informe os dados do veículo', 'Informe os dados do seguro',
            'Informações sobre vistoria e laudos', 'Anexe os documentos solicitados',
            'Revisão das informações e deferimento'],
        steps: ['Dados do Veículo', 'Dados do seguro', 'Vistoria e laudos', 'Documentos', 'Revisão'],
        subtitle: ['Informe os dados do Veículo', 'Informe os dados do Seguro',
            'Preencha os campos abaixo', 'Informe os dados para a baixa'],
        form: {},
        empresas: [],
        razaoSocial: '',
        delegatarioCompartilhado: '',
        frota: [],
        toastMsg: 'Veículo cadastrado!',
        confirmToast: false,
        activeStep: 0,
        files: [],
        fileNames: [],
        modelosChassi: [],
        seguradoras: [],
        insuranceExists: false,
        equipamentos: [],
        addEquipa: false,
        addedPlaca: '',
        openDialog: false
    }

    async componentDidMount() {
        const modelosChassi = axios.get('/api/modeloChassi')
        const carrocerias = axios.get('/api/carrocerias')
        const veiculos = axios.get('/api/veiculosInit')
        const empresas = axios.get('/api/empresas')
        const seguradoras = axios.get('/api/seguradoras')
        const seguros = axios.get('/api/seguros')
        const equipamentos = axios.get('/api/equipa')

        await Promise.all([modelosChassi, carrocerias, veiculos, empresas, seguradoras, seguros, equipamentos])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([modelosChassi, carrocerias, veiculos, empresas, seguradoras, seguros, equipamentos]) => {
                this.setState({
                    modelosChassi, carrocerias, veiculos, empresas, seguradoras, equipamentos,
                    seguros, allInsurances: seguros
                })
            })

        let obj = {}
        this.state.equipamentos.forEach(e => Object.assign(obj, { [e.item]: false }))
        this.setState(obj)
        document.addEventListener('keydown', this.escFunction, false)
    }
    componentWillUnmount() { this.setState({}) }

    changeTab = (e, value) => {
        const opt = ['Veículo cadastrado!', 'Seguro atualizado!', 'Dados Alterados!', 'Veículo Baixado.']
        this.setState({
            tab: value, toastMsg: opt[value], razaoSocial: '', frota: [], placa: '',
            delegatarioCompartilhado: '',
            apolice: '', seguradora: '', dataEmissao: '', vencimento: '',
            seguros: this.state.allInsurances
        })
    }

    setActiveStep = async action => {

        if (this.state.activeStep === 0) {
            const matchPlaca = this.state.frota.filter(v => v.placa === this.state.placa)[0]
            if (matchPlaca) {
                await this.setState({ placa: '' });
                this.createAlert('plateExists')
                return null
            }
        }

        let array = []
        const { equipamentos } = this.state
        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })

        if (prevActiveStep === 1) {
            equipamentos.forEach(async e => {
                if (this.state[e.item] === true) {
                    await array.push(e.item)
                }
            })
            this.setState({ equipamentos_id: array })
        }
    }

    handleInput = async e => {
        const { name } = e.target
        let { value } = e.target       
        const parsedName = humps.decamelize(name)
        if (name !== 'razaoSocial') this.setState({ [name]: value, form: { ...this.state.form, [parsedName]: value } })
        if (name === 'placa' && this.state.tab === 0) {
            if (typeof value === 'string') {            
                value = value.toLocaleUpperCase()
                await this.setState({[name]:value})
                return null
            }
        }
        else this.setState({ [name]: value })
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
        const { empresas, tab, frota, placa, modelosChassi, carrocerias, seguradoras, allInsurances,
            veiculos } = this.state
        const { name } = e.target
        let { value } = e.target

        switch (name) {
            case 'modeloChassi':
                this.getId(name, value, modelosChassi, 'modeloChassiId', 'modeloChassi', 'id', 'Chassi')
                break;
            case 'modeloCarroceria':
                this.getId(name, value, carrocerias, 'modeloCarroceriaId', 'modelo', 'id', 'Modelo de carroceria')
                break;
            case 'delegatarioCompartilhado':
                this.getId(name, value, empresas, 'compartilhadoId', 'razaoSocial', 'delegatarioId')
                break;
            case 'seguradora':
                await this.getId(name, value, seguradoras, 'seguradoraId', 'seguradora', 'id', 'Seguradora')

                let filteredInsurances = []

                if (this.state.delegatarioId && this.state.seguradora === '') {
                    filteredInsurances = allInsurances.filter(s => s.delegatarioId === this.state.delegatarioId)
                    this.setState({ seguros: filteredInsurances })

                }
                if (!this.state.delegatarioId && this.state.seguradora !== '') {
                    filteredInsurances = allInsurances.filter(s => s.seguradora === this.state.seguradora)
                    this.setState({ seguros: filteredInsurances })
                }
                if (this.state.delegatarioId && this.state.seguradora !== '') {
                    filteredInsurances = allInsurances
                        .filter(s => s.delegatarioId === this.state.delegatarioId)
                        .filter(s => s.seguradora === this.state.seguradora)
                    this.setState({ seguros: filteredInsurances })
                }
                break;

            case 'razaoSocial':
                await this.getId(name, value, empresas, 'delegatarioId', 'razaoSocial', 'delegatarioId', 'Empresa')
                if (this.state.delegatarioId) {
                    const f = veiculos.filter(v => v.delegatarioId === this.state.delegatarioId)
                    const filteredInsurances = allInsurances.filter(s => s.delegatarioId === this.state.delegatarioId)
                    this.setState({ frota: f, seguros: filteredInsurances })
                }
                break;

            case 'apolice':
                let insuranceExists = this.state.seguros.filter(s => s.apolice === this.state.apolice)
                if (insuranceExists && insuranceExists[0] !== undefined && insuranceExists[0].dataEmissao && insuranceExists[0].vencimento) {
                    const dataEmissao = insuranceExists[0].dataEmissao.toString().slice(0, 10),
                        vencimento = insuranceExists[0].vencimento.toString().slice(0, 10),
                        seguradora = insuranceExists[0].seguradora

                    this.setState({ seguradora, dataEmissao, vencimento, insuranceExists: insuranceExists[0] })
                } else {
                    insuranceExists = false
                    this.setState({ insuranceExists: false })
                }
                break;

            case 'addedPlaca':
                const { addedPlaca } = this.state
                const plate = frota.filter(p => p.placa.match(addedPlaca))
                if (plate && plate[0] && plate[0].length > 0) this.setState({ addedPlaca: plate[0].placa })
                break;
            default:
                void 0
        }

        if (name === 'placa' && typeof this.state.frota !== 'string') {
            if (tab === 0) {
                if (value.length === 7) {
                    const x = value.replace(/(\w{3})/, '$1-')
                    await this.setState({ placa: x })
                    value = x
                }

                const matchPlaca = frota.filter(v => v.placa === placa)[0]
                if (matchPlaca) {
                    await this.setState({ placa: null });
                    value = ''
                    this.createAlert('plateExists')
                    document.getElementsByName('placa')[0].focus()
                }
            }
            /*  if (tab > 1) {
                 const vehicle = this.state.frota.filter(v => v.placa === value)[0]
                 await this.setState({ ...vehicle, disable: true })
                 if (vehicle.hasOwnProperty('empresa')) this.setState({ delegatario: vehicle.empresa })
                 let reset = {}
                 Object.keys(frota[0]).forEach(k => reset[k] = '')
                 if (!vehicle) {
                     this.createAlert('plateNotFound')
                     this.setState({ ...reset, disable: false })
                 }
             } */
        }
    }

    handleCadastro = async e => {
        const { anoCarroceria, equipamentos_id, peso_dianteiro, peso_traseiro,
            poltronas, delegatarioId, compartilhadoId, seguros, modeloChassiId,
            modeloCarroceriaId, seguradoraId } = this.state,
            situacao = 'Ativo',
            indicadorIdade = anoCarroceria

        let pbt = Number(poltronas) * 93 + (Number(peso_dianteiro) + Number(peso_traseiro))
        if (isNaN(pbt)) pbt = undefined

        let review = {}

        cadForm.forEach(form => {
            form.forEach(obj => {
                for (let k in this.state) {
                    if (k === obj.field) {
                        Object.assign(review, { [k]: this.state[k] })
                    }
                }
            })
        })

        let { dataEmissao, vencimento, delegatarioCompartilhado,
            modeloChassi, modeloCarroceria, seguradora, ...vReview } = review

        let seguro = { apolice: review.apolice, seguradoraId, dataEmissao, vencimento }

        Object.assign(vReview, {
            delegatarioId, situacao, indicadorIdade, pbt, equipamentos_id,
            modeloChassiId, modeloCarroceriaId
        })
        vReview.delegatarioCompartilhado = compartilhadoId

        const vehicle = humps.decamelizeKeys(vReview)
        const insurance = humps.decamelizeKeys(seguro)

        const insuranceExists = seguros.filter(s => s.apolice === insurance.apolice)

        if (insuranceExists[0]) {
            await axios.post('/api/cadastroVeiculo', vehicle)
                .then(res => console.log(res.data))
            this.toast()
        } else if (!insuranceExists[0] && insurance.apolice !== undefined && insurance.apolice.length > 3 && insurance.seguradora_id !== undefined) {
            await axios.post('/api/cadSeguro', insurance)
                .then(res => console.log(res.data))
            await axios.post('/api/cadastroVeiculo', vehicle)
                .then(res => console.log(res.data))
            this.toast()
        } else {
            alert('Favor verificar os dados do seguro.')
        }
    }

    toast = e => {
        this.setState({ confirmToast: !this.state.confirmToast })
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

    submitFiles = async e => {
        const { form } = this.state

        await axios.post('/api/upload', form)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
        this.toast()
    }

    handleEquipa = e => {
        this.setState({ addEquipa: !this.state.addEquipa })
    }

    handleCheck = item => {
        this.setState({ ...this.state, [item]: !this.state[item] })
    }

    deleteInsurance = async placaInput => {

        await this.setState({ vehicleFound: this.state.frota.filter(v => v.placa === placaInput)[0] })
        const { vehicleFound } = this.state

        let { insuranceExists } = this.state,
            { placas, veiculos } = insuranceExists

        const body = {
            table: 'veiculo',
            column: 'apolice',
            value: 'Seguro não cadastrado',
            tablePK: 'veiculo_id',
            id: vehicleFound.veiculoId
        }

        const i = placas.indexOf(placaInput)
        placas.splice(i, 1)
        const k = veiculos.indexOf(vehicleFound.veiculoId)
        veiculos.splice(k, 1)

        await axios.put('/api/UpdateInsurance', body)
            .catch(err => console.log(err))
        insuranceExists.placas = placas
        insuranceExists.veiculos = veiculos
        this.setState({ insuranceExists })

        return null
    }

    updateInsurance = async (placaInput, seguroId) => {

        await this.setState({ vehicleFound: this.state.frota.filter(v => v.placa === placaInput)[0] })
        const { vehicleFound } = this.state

        let { insuranceExists } = this.state,
            { placas, veiculos } = insuranceExists

        // Validate plate

        if (!placaInput.match('[a-zA-Z]{3}[-]?\\d{4}')) {
            this.setState({
                openDialog: true,
                dialogTitle: 'Placa inválida',
                message: `Certifique-se de que a placa informada é uma placa válida, com três letras seguidas de 4 números (ex: AAA-0000)`,
            })
            return null
        }

        //Check if vehicle belongs to frota before add to insurance and  if plate already belongs to apolice

        if (vehicleFound === undefined || vehicleFound.hasOwnProperty('veiculoId') === false) {
            this.setState({
                openDialog: true,
                dialogTitle: 'Placa não encontrada',
                message: `A placa informada não corresponde a nenhum veículo da frota da viação selecionada. Para cadastrar um novo veículo, selecione a opção "Cadastro de Veículo" no menu acima.`,
            })
            return null
        } else if (insuranceExists !== undefined && insuranceExists.hasOwnProperty('placas') && vehicleFound.hasOwnProperty('placa')) {
            const check = insuranceExists.placas.find(p => p === vehicleFound.placa)
            if (check !== undefined) {
                this.setState({
                    openDialog: true,
                    dialogTitle: 'Placa já cadastrada',
                    message: `A placa informada já está cadastrada na apólice. Para pesquisar as placas cadastradas, utilize o campo "filtrar" abaixo.`,
                })
                return null
            }
        }

        //Define body to post

        const body = {
            table: 'veiculo',
            column: 'apolice',
            value: seguroId,
            tablePK: 'veiculo_id', id: vehicleFound.veiculoId
        }

        // Add plates to rendered list
        if (seguroId) {
            if (!placas) placas = []
            placas.push(placaInput)
            if (!veiculos) veiculos = []
            veiculos.push(vehicleFound.veiculoId)

            if (insuranceExists.hasOwnProperty('placas') && insuranceExists.hasOwnProperty('veiculos')) {
                let obj = insuranceExists
                obj.placas = placas
                obj.veiculos = veiculos
                this.setState({ insuranceExists: obj })
            }
        }

        // Verify if all fields are filled before add new plate/insurance
        const enableSubmit = cadForm[1]
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        if (!enableSubmit) {
            alert('Favor preencher todos os campos referentes ao seguro.')
            return null
        }

        //Create a new insurance
        if (!insuranceExists.hasOwnProperty('apolice')) {
            const { seguradoraId, apolice, dataEmissao, vencimento } = this.state,
                cadSeguro = { seguradora_id: seguradoraId, apolice, data_emissao: dataEmissao, vencimento }

            await axios.post('/api/cadSeguro', cadSeguro)
        }

        //Delete placa from old array
        if (vehicleFound.apolice !== 'Seguro não cadastrado') {

            let { seguros } = this.state
            const index = seguros.findIndex(s => s.apolice === vehicleFound.apolice)
            if (seguros[index]) {

                let pl = seguros[index].placas,
                    v = seguros[index].veiculos
                const i = pl.indexOf(vehicleFound.placa),
                    k = pl.indexOf(vehicleFound.veiculoId)

                pl.splice(i, 1)
                v.splice(k, 1)

                seguros[index].placas = pl
                seguros[index].veiculos = v
                this.setState({ seguros })
            }
        }

        //Update data to/from DataBase
        await axios.put('/api/UpdateInsurance', body)
            .catch(err => console.log(err))
        await axios.get('/api/seguros')
            .then(r => humps.camelizeKeys(r.data))
            .then(seguros => {
                this.setState({ seguros })
                return seguros
            })
            .then(res => this.setState({ insuranceExists: res.filter(s => s.apolice === seguroId)[0] }))
            .catch(err => console.log(err))

        let updateFrota = this.state.frota
        const vIndex = this.state.frota.findIndex(v => v.veiculoId === vehicleFound.veiculoId)
        updateFrota[vIndex].apolice = seguroId
        await this.setState({ frota: updateFrota })

        if (document.getElementsByName('razaoSocial')[0]) document.getElementsByName('razaoSocial')[0].focus()
        if (document.getElementsByName('seguradora')[0]) document.getElementsByName('seguradora')[0].focus()
        if (document.getElementsByName('apolice')[0]) document.getElementsByName('apolice')[0].focus()
        if (document.getElementsByName('addedPlaca')[0]) document.getElementsByName('addedPlaca')[0].focus()

        this.setState({ addedPlaca: '' })
    }

    toggleDialog = () => {
        this.setState({ openDialog: !this.state.openDialog })
    }

    createAlert = (alert) => {
        let dialogTitle, message

        switch (alert) {
            case 'plateNotFound':
                dialogTitle = 'Placa não encontrada'
                message = 'A placa informada não corresponde a nenhum veículo da frota da viação selecionada.Para cadastrar um novo veículo, selecione a opção "Cadastro de Veículo" no menu acima.'
                break;
            case 'invalidPlate':
                dialogTitle = 'Placa inválida'
                message = 'Certifique-se de que a placa informada é uma placa válida, com três letras seguidas de 4 números (ex: AAA-0000)'
                break;
            case 'fieldsMissing':
                dialogTitle = 'Favor preencher todos os campos.'
                message = 'Os campos acima são de preenchimento obrigatório. Certifique-se de ter preenchido todos eles.'
                break;
            case 'plateExists':
                dialogTitle = 'Placa já cadastrada!'
                message = 'A placa informada já está cadastrada. Para atualizar seguro, alterar dados ou solicitar baixa, utilize as opções acima. '
                break;
            default:
                break;
        }
        this.setState({ openDialog: true, dialogTitle, message })
    }


    render() {
        const { tab, items, confirmToast, toastMsg, activeStep,
            openDialog, dialogTitle, message, steps, stepTitles } = this.state

        const enableAddPlaca = cadForm[1]
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            {tab === 0 && <CustomStepper
                activeStep={activeStep}
                steps={steps}
                stepTitles={stepTitles}
                setActiveStep={this.setActiveStep}
            />}
            {tab < 2 && activeStep < 3 ? <VeiculosTemplate
                data={this.state}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleEquipa={this.handleEquipa}
                handleCheck={this.handleCheck}
            />
                : tab === 0 && activeStep === 3 ?
                    <VehicleDocs
                        tab={tab}
                        handleFiles={this.handleFiles}
                        handleSubmit={this.submitFiles}
                        handleNames={this.handleNames}
                    />
                    : tab === 0 && activeStep === 4 ?
                        <Review data={this.state} />
                        : <Fragment></Fragment>
            }
            {tab === 0 && <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                handleSubmit={this.handleCadastro}
                setActiveStep={this.setActiveStep}
            />}
            {tab === 1 && enableAddPlaca && <AltSeguro
                data={this.state}
                insuranceExists={this.state.insuranceExists}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                addPlateInsurance={this.updateInsurance}
                deleteInsurance={this.deleteInsurance}
            />}
            {tab === 2 && <AltDados
                data={this.state}
                getId={this.getId}
                createAlert={this.createAlert}
            />}
            {tab === 3 && <BaixaVeiculo
                data={this.state}
                getId={this.getId}
                createAlert={this.createAlert}
            />}

            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            <AlertDialog open={openDialog} close={this.toggleDialog} title={dialogTitle} message={message} />
        </Fragment>
    }
}