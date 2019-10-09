import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'
import VeiculosTemplate from './VeiculosTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './Review'
import { TabMenu } from '../Layouts'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { cadForm } from '../Forms/cadForm'
import StepperButtons from './StepperButtons'
import CustomStepper from '../Utils/Stepper'
import AltSeguro from './AltSeguro'
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
        tab: 1,
        items: ['Cadastro de Veículo', 'Atualização de Seguro',
            'Alteração de dados', 'Baixa de Veículo'],
        subtitle: ['Informe os dados do Veículo', 'Informe os dados do Seguro',
            'Preencha os campos abaixo', 'Informe os dados para a baixa'],
        form: {},
        empresas: [],
        selectedEmpresa: '',
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
        this.setState({ tab: value, toastMsg: opt[value] })
    }

    setActiveStep = action => {

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

    handleInput = e => {
        const { name, value } = e.target
        const parsedName = humps.decamelize(name)
        if (name !== 'razaoSocial') this.setState({ [name]: value, form: { ...this.state.form, [parsedName]: value } })
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
        const { empresas, tab, frota, placa, modelosChassi, carrocerias, seguradoras, seguros, allInsurances,
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
                if (insuranceExists[0] !== false && insuranceExists[0] !== undefined && insuranceExists[0].dataEmissao && insuranceExists[0].vencimento) {
                    const dataEmissao = insuranceExists[0].dataEmissao.toString().slice(0, 10),
                        vencimento = insuranceExists[0].vencimento.toString().slice(0, 10),
                        seguradora = insuranceExists[0].seguradora

                    this.setState({ seguradora, dataEmissao, vencimento, insuranceExists: insuranceExists[0] })
                } else if (insuranceExists[0]) {
                    console.log(this.state.insuranceExists)
                }
                else {
                    insuranceExists = false
                    this.setState({ insuranceExists: false })
                }
                break;

            case 'addedPlaca':
                const { addedPlaca } = this.state
                const plate = frota.filter(p => p.placa.match(addedPlaca))
                if (plate && plate[0]) this.setState({ addedPlaca: plate[0].placa })
                break;
            default:
                void 0
        }

        if (name === 'placa' && typeof this.state.frota !== 'string') {
            if (tab === 0) {
                if (value.length === 7) {
                    const x = value.replace(/(\w{3})/, '$1-')
                    this.setState({ placa: x })
                    value = x
                }

                const matchPlaca = frota.filter(v => v.placa === placa)[0]
                if (matchPlaca) {
                    await this.setState({ placa: null })
                    value = ''
                    alert('Placa já cadastrada!')
                    document.getElementsByName('placa')[0].focus()
                }
            }
            const vehicle = this.state.frota.filter(v => v.placa === value)[0]
            await this.setState({ ...vehicle })
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

    handleSubmit = async e => {
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

    updateInsurance = async (placaInput, seguroId) => {

        const { frota } = this.state,
            vehicleFound = frota.filter(v => v.placa === placaInput)[0]

        let { insuranceExists } = this.state,
            { placas, veiculos } = insuranceExists

        let value = 'Seguro não cadastrado'
        let body

        // Validate plate

        if (!placaInput.match('[a-zA-Z]{3}[-]?\\d{4}')) {
            this.setState({
                openDialog: true,
                dialogTitle: 'Placa inválida',
                message: `Certifique-se de que a placa informada é uma placa válida, com três letras seguidas de 4 números (ex: AAA-0000)`,
            })
            return null
        }

        //Choose between edit or delete placa from insurance

        if (seguroId) {
            value = seguroId
            if (!placas) placas = []
            placas.push(placaInput)
            if (!veiculos) veiculos = []
            veiculos.push(vehicleFound.veiculoId)

            if (insuranceExists.hasOwnProperty('placas')) insuranceExists.placas = placas
            if (insuranceExists.hasOwnProperty('veiculos')) insuranceExists.veiculos = veiculos
        } else {
            const i = placas.indexOf(placaInput)
            placas.splice(i, 1)
            const k = veiculos.indexOf(vehicleFound.veiculoId)
            veiculos.splice(k, 1)
        }

        //Check if vehicle belongs to frota before add to insurance

        if (vehicleFound && vehicleFound.hasOwnProperty('veiculoId')) {
            body = {
                table: 'veiculo',
                column: 'apolice', value,
                tablePK: 'veiculo_id', id: vehicleFound.veiculoId
            }
        } else {
            this.setState({
                openDialog: true,
                dialogTitle: 'Placa não encontrada',
                message: `A placa informada não corresponde a nenhum veículo da frota da viação selecionada. Para cadastrar um novo veículo, selecione a opção "Cadastro de Veículo" no menu acima.`,
            })
            const i = placas.indexOf(placaInput)
            placas.splice(i, 1)
            return null
        }

        // Verify if all fields are filled before add new plate/insurance

        const enableSubmit = cadForm[1]
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        //Add plate to existing insurance
        if (insuranceExists.hasOwnProperty('apolice')) {

            if (vehicleFound.apolice !== 'Seguro não cadastrado') {

                /*   let seguros = this.state.seguros
                  const index = seguros.findIndex(s => s.apolice === vehicleFound.apolice)
                  let pl = seguros[index].placas,
                      v = seguros[index].veiculos
                  const i = pl.indexOf(vehicleFound.placa)
                  const k = pl.indexOf(vehicleFound.veiculoId)
                  pl.splice(i, 1)
                  v.splice(k, 1)
                  seguros[index].placas = pl
                  seguros[index].veiculos = v
                  insuranceExists = seguros */

                await axios.put('/api/UpdateInsurance', body)
                    .then(r => console.log(r.data))
                    .catch(err => console.log(err))
                await axios.get('/api/seguros')
                    .then(async r => {
                        const seguros = humps.camelizeKeys(r.data)
                        await this.setState({ seguros })
                        document.getElementsByName('razaoSocial')[0].focus()
                        document.getElementsByName('seguradora')[0].focus()
                        document.getElementsByName('apolice')[0].focus()
                        document.getElementsByName('addedPlaca')[0].focus()

                        insuranceExists = seguros.filter(s => s.apolice === seguroId)
                        if (insuranceExists[0] !== undefined && insuranceExists[0].dataEmissao && insuranceExists[0].vencimento) {
                            await this.setState({ insuranceExists: insuranceExists[0] })
                            console.log(this.state.seguros)
                            return null
                        }
                    })
                    .catch(err => console.log(err))


                /* axios.get(`/api/getUpdatedInsurance?apolice=${vehicleFound.apolice}`)
                    .then(r => console.log(r.data))

 */
            } else {
                await axios.put('/api/UpdateInsurance', body)
                    .then(r => {
                        this.setState({ insuranceExists })
                        console.log(r.data)
                    })
                    .catch(err => console.log(err))
            }



            /*  if (vehicleFound.apolice !== 'Seguro não cadastrado') {
                 axios.get('/api/getUpdatedInsurance')
                     .then(r => this.setState({ insuranceExists: humps.camelizeKeys(r.data) }))
             } else return null */

        } else if (enableSubmit) {          //Create new insurance

            const { seguradoraId, apolice, dataEmissao, vencimento } = this.state,
                cadSeguro = { seguradora_id: seguradoraId, apolice, data_emissao: dataEmissao, vencimento }

            await axios.post('/api/cadSeguro', cadSeguro)
            await axios.get('/api/seguros')
                .then(async r => {
                    await this.setState({ seguros: humps.camelizeKeys(r.data) })
                    insuranceExists = this.state.seguros.filter(s => s.apolice === apolice)[0]
                    this.setState({ insuranceExists })
                    void 0
                })
                .catch(err => console.log(err))

            await axios.put('/api/UpdateInsurance', body)
            axios.get('/api/veiculosInit')
                .then(r => this.setState({ veiculos: humps.camelizeKeys(r.data) }))
                .catch(err => console.log(err))
        }
    }

    toggleDialog = () => {
        this.setState({ openDialog: !this.state.openDialog })
    }

    render() {
        const { tab, items, selectedEmpresa, confirmToast, toastMsg, activeStep,
            openDialog, dialogTitle, message } = this.state

        const enableAddPlaca = cadForm[1]
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            {tab === 0 && <CustomStepper
                activeStep={activeStep}
                setActiveStep={this.setActiveStep}
                selectedEmpresa={selectedEmpresa}
            />}
            {activeStep < 3 ? <VeiculosTemplate
                data={this.state}
                selectedEmpresa={selectedEmpresa}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleEquipa={this.handleEquipa}
                handleCheck={this.handleCheck}
            />
                : tab === 0 && activeStep === 3 ?
                    <VehicleDocs
                        data={this.state}
                        handleFiles={this.handleFiles}
                        handleSubmit={this.handleSubmit}
                        handleNames={this.handleNames}
                    />
                    : tab === 0 && activeStep === 4 ?
                        <Review data={this.state} />
                        : <Fragment></Fragment>
            }
            {tab === 0 && <StepperButtons
                activeStep={activeStep}
                handleCadastro={this.handleCadastro}
                setActiveStep={this.setActiveStep}
            />}
            {
                tab === 1 && enableAddPlaca && <AltSeguro
                    data={this.state}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    addPlateInsurance={this.updateInsurance}
                    handleDelete={this.updateInsurance}
                />
            }
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            <AlertDialog open={openDialog} close={this.toggleDialog} title={dialogTitle} message={message} />
        </Fragment>
    }
}