import React, { PureComponent, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import StoreHOC from '../Store/StoreHOC'

import CadVeiculoTemplate from './CadVeiculoTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './Review'

import Crumbs from '../Utils/Crumbs'
import StepperButtons from '../Utils/StepperButtons'
import CustomStepper from '../Utils/Stepper'

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
        steps: ['Dados do Veículo', 'Dados do seguro', 'Vistoria e laudos', 'Documentos', 'Revisão'],
        subtitle: ['Informe os dados do Veículo', 'Informe os dados do Seguro',
            'Preencha os campos abaixo conforme a vistoria realizada'],
        form: {},
        stateFormData: new FormData(),
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
                this.setState({ alertType: 'plateExists', openDialog: true })
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
        const { veiculos, allInsurances } = this.state

        if (name === 'razaoSocial') {
            let selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                const { razaoSocial, delegatarioId } = selectedEmpresa
                await this.setState({ selectedEmpresa, razaoSocial, delegatarioId })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)
                const filteredInsurances = allInsurances.filter(seguro => seguro.empresa === this.state.razaoSocial)

                this.setState({ frota, seguros: filteredInsurances })

            } else this.setState({ selectedEmpresa: undefined, frota: [] })
        }

        if (name !== 'razaoSocial') this.setState({ [name]: value, form: { ...this.state.form, [parsedName]: value } })
        if (name === 'placa') {
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
        const { empresas, frota, placa, modelosChassi, carrocerias, seguradoras,
            allInsurances, delegatarioId } = this.state
        const { name } = e.target
        let { value } = e.target
        console.log(delegatarioId)
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

            if (value.length === 7) {
                const x = value.replace(/(\w{3})/, '$1-')
                await this.setState({ placa: x })
                value = x
                const matchPlaca = frota.filter(v => v.placa === this.state.placa)[0]
                if (matchPlaca) {
                    await this.setState({ placa: null });
                    value = ''
                    this.setState({ alertType: 'plateExists', openDialog: true })
                    document.getElementsByName('placa')[0].focus()
                }

            }
            const matchPlaca2 = frota.filter(v => v.placa === placa)[0]
            if (matchPlaca2) {
                await this.setState({ placa: null });
                value = ''
                this.setState({ alertType: 'plateExists', openDialog: true })
                document.getElementsByName('placa')[0].focus()
            }

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

        let formData = this.state.stateFormData,
            newForm = new FormData()

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
                .then(res => {
                    const v_Id = res.data[0].veiculo_id
                    newForm.append('veiculoId', v_Id);
                    for (let entry of formData.entries()) {
                        newForm.append(entry[0], entry[1])
                    }
                })
            axios.post('/api/mongoUpload', newForm).then(res => {
                console.log(res.data)
            })
                .catch(err => console.log(err))
            this.toast()
        } else if (!insuranceExists[0] && insurance.apolice !== undefined && insurance.apolice.length > 3 && insurance.seguradora_id !== undefined) {
            await axios.post('/api/cadSeguro', insurance)
                .then(res => console.log(res.data))
            await axios.post('/api/cadastroVeiculo', vehicle)
                .then(res => {
                    const v_Id = res.data[0].veiculo_id
                    newForm.append('veiculoId', v_Id);
                    for (let entry of formData.entries()) {
                        newForm.append(entry[0], entry[1])
                    }
                })
            axios.post('/api/mongoUpload', newForm).then(res => {
                console.log(res.data)
            })
                .catch(err => console.log(err))
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

        await axios.post('/api/mongoUpload', form)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
        this.toast()
    }

    showFiles = id => {

        let selectedFiles = this.state.files.filter(f => f.metadata.veiculoId === id.toString())

        if (selectedFiles[0]) {
            this.setState({ filesCollection: selectedFiles, showFiles: true, selectedVehicle: id })

        } else {
            this.setState({ alertType: 'filesNotFound', openDialog: true })
            this.setState({ filesCollection: [] })
        }
    }

    handleCheck = item => this.setState({ ...this.state, [item]: !this.state[item] })
    handleEquipa = () => this.setState({ addEquipa: !this.state.addEquipa })
    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })

    render() {
        const { confirmToast, toastMsg, activeStep,
            openDialog, alertType, steps, selectedEmpresa } = this.state

        /*   const enableAddPlaca = cadForm[1]
              .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '') */

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
                handleSubmit={this.submitFiles}
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
            {openDialog && <AlertDialog open={openDialog} close={this.toggleDialog} alertType={alertType} />}
        </Fragment>
    }
}
const collections = ['veiculos', 'empresas', 'modelosChassi', 'carrocerias',
    'seguradoras', 'seguros', 'equipamentos']

export default StoreHOC(collections, VeiculosContainer)