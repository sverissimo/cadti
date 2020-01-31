import React, { PureComponent, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import moment from 'moment'

import StoreHOC from '../Store/StoreHOC'

import { checkInputErrors } from '../Utils/checkInputErrors'
import CadVeiculoTemplate from './CadVeiculoTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './Review'

import Crumbs from '../Utils/Crumbs'
import StepperButtons from '../Utils/StepperButtons'
import CustomStepper from '../Utils/Stepper'
import ReactToast from '../Utils/ReactToast'

import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { cadForm } from '../Forms/cadForm'

import AlertDialog from '../Utils/AlertDialog'

class VeiculosContainer extends PureComponent {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.addEquipa) this.handleEquipa()
            }
        }
    }

    state = {
        activeStep: 0,
        steps: ['Dados do Veículo', 'Dados do seguro', 'Vistoria e laudos', 'Documentos', 'Revisão'],
        subtitle: ['Informe os dados do Veículo', 'Informe os dados do Seguro',
            'Preencha os campos abaixo conforme a vistoria realizada'],
        razaoSocial: '',
        frota: [],
        delegatarioCompartilhado: '',
        toastMsg: 'Veículo cadastrado!',
        confirmToast: false,
        files: [],
        fileNames: [],
        insuranceExists: false,
        addEquipa: false,
        openAlertDialog: false
    }

    async componentDidMount() {

        const { redux } = this.props
        let equipamentos = {}

        if (redux && redux.equipamentos) {
            redux.equipamentos.forEach(e => Object.assign(equipamentos, { [e.item]: false }))
            await this.setState({ ...this.props.redux, ...equipamentos, allInsurances: this.props.redux['seguros'] })
        }
        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() { this.setState({}) }

    setActiveStep = async action => {

        if (this.state.activeStep === 0) {
            const matchPlaca = this.state.frota.filter(v => v.placa === this.state.placa)[0]
            if (matchPlaca) {
                await this.setState({ placa: '' });
                this.setState({ alertType: 'plateExists', openAlertDialog: true })
                return null
            }
        }

        const { errors } = this.state
        if (errors && errors[0]) {
            await this.setState({ ...this.state, ...checkInputErrors('setState') })            
            return
        }

        let array = []
        const { equipamentos } = this.state
        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })

        if (prevActiveStep === 1) {
            equipamentos.forEach(e => {
                if (this.state[e.item] === true) {
                    array.push(e.item)
                }
            })
            if (array[0]) this.setState({ equipamentos_id: array })
        }
    }

    handleInput = async e => {
        const { name } = e.target
        let { value } = e.target
        const { veiculos, allInsurances } = this.state

        if (name === 'razaoSocial') {
            this.setState({ [name]: value })

            let selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                const { razaoSocial, delegatarioId } = selectedEmpresa
                await this.setState({ selectedEmpresa, razaoSocial, delegatarioId })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)
                const filteredInsurances = allInsurances.filter(seguro => seguro.empresa === this.state.razaoSocial)

                this.setState({ frota, seguros: filteredInsurances })

            } else this.setState({ selectedEmpresa: undefined, frota: [], placa: undefined, apolice: undefined })
        }
        else if (name === 'placa') {
            if (typeof value === 'string') {
                value = value.toLocaleUpperCase()
                await this.setState({ [name]: value })
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
        const { empresas, frota, modelosChassi, carrocerias, seguradoras,
            allInsurances } = this.state
        const { name } = e.target
        let { value } = e.target

        const errors = checkInputErrors()
        if (errors) this.setState({ errors })
        else this.setState({ errors: undefined })

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
                break
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
                break
            default:
                void 0
        }

        if (name === 'placa' && typeof this.state.frota !== 'string') {

            if (value.length === 7) {
                const x = value.replace(/(\w{3})/, '$1-')
                await this.setState({ placa: x })
                value = x
            }
            const matchPlaca = frota.find(v => v.placa === value)
            if (matchPlaca) {
                await this.setState({ placa: null });
                value = ''
                this.setState({ alertType: 'plateExists', openAlertDialog: true })
                document.getElementsByName('placa')[0].focus()
            }
        }
    }

    handleCadastro = async () => {
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
                    if (k === obj.field) Object.assign(review, { [k]: this.state[k] })
                }
            })
        })

        let { dataEmissao, vencimento, delegatarioCompartilhado,
            modeloChassi, modeloCarroceria, seguradora, ...vReview } = review,

            seguro = { apolice: review.apolice, seguradoraId }

        const validEmissao = moment(dataEmissao, 'YYYY-MM-DD', true).isValid(),
            validVenc = moment(vencimento, 'YYYY-MM-DD', true).isValid()

        if (validEmissao) seguro.dataEmissao = dataEmissao
        if (validVenc) seguro.vencimento = vencimento

        Object.assign(vReview, {
            delegatarioId, situacao, indicadorIdade, pbt, equipamentos_id,
            modeloChassiId, modeloCarroceriaId
        })
        vReview.delegatarioCompartilhado = compartilhadoId

        Object.keys(vReview).forEach(key => {
            if (vReview[key] === '') delete vReview[key]
        })
        Object.keys(seguro).forEach(key => {
            if (seguro[key] === '') delete seguro[key]
        })

        const vehicle = humps.decamelizeKeys(vReview)
        const insurance = humps.decamelizeKeys(seguro)

        const insuranceExists = seguros.filter(s => s.apolice === insurance.apolice)

        if (insuranceExists[0]) {
            await axios.post('/api/cadastroVeiculo', vehicle)
                .then(res => {
                    const veiculoId = res.data[0].veiculo_id
                    this.submitFiles(veiculoId)
                })
                .catch(err => console.log(err))
            this.toast()
        } else if (!insuranceExists[0] && insurance.apolice !== undefined
            && insurance.apolice.length > 2 && insurance.seguradora_id !== undefined) {
            await axios.post('/api/cadSeguro', insurance)
                .then(res => console.log(res.data))
            await axios.post('/api/cadastroVeiculo', vehicle)
                .then(res => {
                    const veiculoId = res.data[0].veiculo_id
                    this.submitFiles(veiculoId)
                })
                .catch(err => console.log(err))
            this.toast()
        } else {
            alert('Favor verificar os dados do seguro.')
        }
    }

    handleFiles = async e => {
        const { name, files } = e.target

        if (files && files[0]) {

            document.getElementById(name).value = files[0].name

            let formData = new FormData(),
                fn = this.state.fileNames

            if (files && files.length > 0) {

                fn.push({ [name]: files[0].name })
                await this.setState({ filesNames: fn, [name]: files[0] })

                cadVehicleFiles.forEach(({ name }) => {
                    for (let keys in this.state) {
                        if (keys.match(name)) {
                            formData.append(name, this.state[name])
                        }
                        else void 0
                    }
                })
                this.setState({ form: formData })
            }
        }
    }

    submitFiles = async veiculoId => {
        let newForm = new FormData()

        newForm.append('veiculoId', veiculoId);
        for (let pair of this.state.form.entries()) {
            if (pair[0] && pair[1]) newForm.append(pair[0], pair[1])
            else newForm = null
        }
        if (newForm) await axios.post('/api/mongoUpload', newForm)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
        return null
    }

    showFiles = id => {

        let selectedFiles = this.state.files.filter(f => f.metadata.veiculoId === id.toString())

        if (selectedFiles[0]) {
            this.setState({ filesCollection: selectedFiles, showFiles: true, selectedVehicle: id })

        } else {
            this.setState({ alertType: 'filesNotFound', openAlertDialog: true })
            this.setState({ filesCollection: [] })
        }
    }

    handleCheck = item => this.setState({ ...this.state, [item]: !this.state[item] })
    handleEquipa = () => this.setState({ addEquipa: !this.state.addEquipa })
    toggleDialog = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { confirmToast, toastMsg, activeStep,
            openAlertDialog, alertType, steps, selectedEmpresa } = this.state
        console.log(openAlertDialog)
        return <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Cadastro de veículo' />

            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                setActiveStep={this.setActiveStep}
            />
            <CadVeiculoTemplate
                data={this.state}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleEquipa={this.handleEquipa}
                handleCheck={this.handleCheck}
                match={this.props.match}
            />
            {activeStep === 3 && <VehicleDocs
                parentComponent='cadastro'
                handleFiles={this.handleFiles}
                handleNames={this.handleNames}
                showFiles={this.showFiles}
            />}

            {activeStep === 4 && <Review parentComponent='cadastro' data={this.state} />}

            {selectedEmpresa && <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                handleSubmit={this.handleCadastro}
                setActiveStep={this.setActiveStep}
            />}
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.toggleDialog} alertType={alertType} customMessage={this.state.customMsg}/>}
        </Fragment>
    }
}
const collections = ['veiculos', 'empresas', 'modelosChassi', 'carrocerias',
    'seguradoras', 'seguros', 'equipamentos']

export default StoreHOC(collections, VeiculosContainer)