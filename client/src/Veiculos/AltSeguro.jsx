import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import { connect } from 'react-redux'

import StoreHOC from '../Store/StoreHOC'
import { removeInsurance, updateCollection } from '../Store/dataActions'

import ReactToast from '../Utils/ReactToast'
import moment from 'moment'

import AltSeguroTemplate from './AltSeguroTemplate'
import { checkInputErrors } from '../Utils/checkInputErrors'
import AlertDialog from '../Utils/AlertDialog'
import { seguroForm } from '../Forms/seguroForm'

class AltSeguro extends Component {

    state = {
        addedPlaca: '',
        insuranceExists: {},
        razaoSocial: '',
        seguradora: '',
        newPlates: [],
        newVehicles: [],
        toastMsg: 'Seguro atualizado!',
        confirmToast: false,
        dropDisplay: 'Clique ou arraste para anexar a apólice'
    }

    componentDidMount() {
        this.setState({
            ...this.props.redux,
            allInsurances: this.props.redux['seguros']
        })
    }

    checkExistance = async (name, inputValue) => {

        const
            { seguros, veiculos } = this.props.redux,
            { selectedEmpresa, newInsurance } = this.state,
            s = [...seguros.filter(se => se.delegatarioId === selectedEmpresa.delegatarioId)],
            frota = veiculos.filter(v => v.delegatarioId === selectedEmpresa.delegatarioId)

        let insuranceExists,
            testApolice = { ...s.find(s => s[name] === inputValue) },
            testSeguradora = { ...s.find(s => s[name] === inputValue && s.apolice === this.state.apolice) },
            InsuranceUpdatedFrota = [],
            updatedPlates = [],
            updatedVehicles = []

        if (name === 'apolice') {
            insuranceExists = testApolice
            InsuranceUpdatedFrota = frota.filter(v => v.apolice === inputValue)

            if (newInsurance && newInsurance.apolice && newInsurance.apolice !== inputValue) {
                this.setState({ newInsurance: false, dataEmissao: '', vencimento: '' })
            }
        }

        if (name === 'seguradora') {
            insuranceExists = testSeguradora
            InsuranceUpdatedFrota = frota.filter(v => v.apolice === this.state.apolice)
        }
        if (insuranceExists && insuranceExists.dataEmissao && insuranceExists.vencimento) {
            InsuranceUpdatedFrota.forEach(v => {
                updatedPlates.push(v.placa)
                updatedVehicles.push(v.veiculoId)
            })

            insuranceExists.placas = updatedPlates
            insuranceExists.veiculos = updatedVehicles

            const dataEmissao = moment(insuranceExists.dataEmissao).format('YYYY-MM-DD'),
                vencimento = insuranceExists.vencimento.toString().slice(0, 10),
                seguradora = insuranceExists.seguradora
            await this.setState({ seguradora, dataEmissao, vencimento, insuranceExists })
            return
        }
        if (Object.keys(insuranceExists).length === 0) this.setState({ insuranceExists: false, dataEmissao: '', vencimento: '' })
    }

    handleInput = async e => {

        let { value } = e.target
        const
            { name } = e.target,
            { veiculos } = this.props.redux,
            { allInsurances, selectedEmpresa, frota, insuranceExists, apolice, dataEmissao,
                vencimento, newInsurance, seguradora } = this.state

        this.setState({ [name]: value })

        switch (name) {
            case 'razaoSocial':
                let selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

                if (selectedEmpresa) {
                    await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                    if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })
                    const
                        frota = veiculos.filter(v => v.empresa === this.state.razaoSocial),
                        filteredInsurances = allInsurances.filter(seguro => seguro.empresa === this.state.razaoSocial)

                    this.setState({ frota, seguros: filteredInsurances })

                } else this.clearFields()
                break

            case 'apolice':
                this.checkExistance('apolice', value)
                break

            case 'seguradora':
                this.checkExistance(name, value)
                const selectedSeguradora = this.state.seguradoras.find(sg => sg.seguradora === value)
                if (selectedSeguradora) {
                    this.setState({ seguradoraId: selectedSeguradora.id })
                }
                break

            case 'addedPlaca':
                const vehicleFound = frota.find(v => v.placa === value)
                if (vehicleFound) this.setState({ vehicleFound })
                break;
            default:
                void 0
        }

        // *************NEW INSURANCE CHECK / UPDATE STATE****************

        const fields = ['seguradora', 'apolice', 'dataEmissao', 'vencimento']
        const checkFields = fields.every(f => this.state[f] && this.state[f] !== '')

        if (name !== 'razaoSocial' && !newInsurance && checkFields && Object.keys(insuranceExists).length === 0) {
            let newInsurance = {}, seguradoraId
            const selectedSeguradora = this.state.seguradoras.find(sg => sg.seguradora === this.state.seguradora)
            if (selectedSeguradora) seguradoraId = selectedSeguradora.id

            Object.assign(newInsurance,
                {
                    empresa: selectedEmpresa.razaoSocial,
                    delegatarioId: selectedEmpresa.delegatarioId,
                    apolice, seguradora, seguradoraId,  dataEmissao, vencimento, placas: [], veiculos: []
                })

            await this.setState({ newInsurance, seguradoraId })
        }
    }

    handleBlur = e => {
        const { seguradoras, seguradora, allInsurances, selectedEmpresa } = this.state,
            { name } = e.target

        if (name === 'seguradora') {
            let filteredInsurances = []

            const valid = seguradoras.find(s => s.seguradora.toLowerCase().match(seguradora.toLowerCase()))
            if (valid && seguradora.length > 2) this.setState({ seguradora: valid.seguradora })
            if (!valid && seguradora.length > 2) this.setState({ openAlertDialog: true, alertType: 'seguradoraNotFound', seguradora: undefined })

            if (selectedEmpresa && !seguradora) {
                filteredInsurances = allInsurances.filter(seguro => seguro.empresa === selectedEmpresa.razaoSocial)
                this.setState({ seguros: filteredInsurances })
            }
            else if (!selectedEmpresa && seguradora !== '') {
                filteredInsurances = allInsurances.filter(s => s.seguradora === seguradora)
                this.setState({ seguros: filteredInsurances })
            }
            else if (selectedEmpresa && seguradora !== '') {
                filteredInsurances = allInsurances
                    .filter(seg => seg.empresa === selectedEmpresa.razaoSocial)
                    .filter(seg => seg.seguradora === seguradora)
                this.setState({ seguros: filteredInsurances })
            }
        }
        if (name === 'dataEmissao' || name === 'vencimento') {
            const errors = checkInputErrors()
            if (errors) this.setState({ errors })
            else this.setState({ errors: undefined })
        }
    }

    addPlate = async placaInput => {
        const { vehicleFound, apolice } = this.state
        let { insuranceExists, newInsurance } = this.state

        if (!placaInput || placaInput === '') return

        //Check if vehicle belongs to frota before add to insurance and  if plate already belongs to apolice
        if (vehicleFound === undefined || vehicleFound.hasOwnProperty('veiculoId') === false) {
            this.setState({ openAlertDialog: true, alertType: 'plateNotFound' })
            return null
        } else if (insuranceExists !== undefined && insuranceExists.hasOwnProperty('placas') && vehicleFound.hasOwnProperty('placa')) {
            const check = insuranceExists.placas.find(p => p === vehicleFound.placa)
            if (check !== undefined) {
                this.setState({ openAlertDialog: true, alertType: 'plateExists' })
                return null
            }
        }
        // Add plates to rendered list
        if (apolice) {
            if (!insuranceExists.placas && !insuranceExists.veiculos) {

                let update = { ...newInsurance }
                update.placas.push(placaInput)
                update.veiculos.push(vehicleFound.veiculoId)

                await this.setState({
                    newInsurance: update,
                    newPlates: [...this.state.newPlates, placaInput],
                    newVehicles: [...this.state.newVehicles, vehicleFound.veiculoId]
                })

            } else {
                let obj = { ...insuranceExists }
                let { placas, veiculos } = obj

                placas.push(placaInput)
                veiculos.push(vehicleFound.veiculoId)
                obj.placas = placas
                obj.veiculos = veiculos

                await this.setState({
                    insuranceExists: obj,
                    newPlates: [...this.state.newPlates, placaInput],
                    newVehicles: [...this.state.newVehicles, vehicleFound.veiculoId]
                })
            }
            if (document.getElementsByName('addedPlaca')[0]) document.getElementsByName('addedPlaca')[0].focus()
            this.setState({ addedPlaca: '' })
        }
    }

    deleteInsurance = async placaInput => {

        await this.setState({ vehicleFound: this.state.frota.find(v => v.placa === placaInput) })
        const { vehicleFound, apolice } = this.state

        let insuranceExists = { ...this.state.insuranceExists },
            { placas, veiculos } = insuranceExists,
            newInsurance = { ...this.state.newInsurance }

        if (newInsurance && newInsurance.apolice) {
            let newPlates = [...newInsurance.placas],
                newVehicles = [...newInsurance.veiculos]

            const
                i = newPlates.indexOf(placaInput),
                k = newVehicles.indexOf(vehicleFound.veiculoId)

            newInsurance.placas.splice(i, 1)
            newInsurance.veiculos.splice(k, 1)
            await this.setState({ newInsurance })
            return
        }


        const body = {
            table: 'veiculo',
            column: 'apolice',
            value: 'Seguro não cadastrado',
            tablePK: 'veiculo_id',
            ids: [vehicleFound.veiculoId]
        }

        await axios.put('/api/UpdateInsurances', body)
        /*  await axios.get('/api/seguros')
             .then(res => humps.camelizeKeys(res.data))
             .then(res => this.props.updateCollection(res, 'seguros'))
             .catch(err => console.log(err)) */
        const
            i = placas.indexOf(placaInput),
            k = veiculos.indexOf(vehicleFound.veiculoId)

        await this.props.removeInsurance(apolice, i, k)

        insuranceExists.placas.splice(i, 1)
        insuranceExists.veiculos.splice(k, 1)

        await this.setState({ insuranceExists })
        return
    }

    handleSubmit = async () => {

        const { seguradora, insuranceExists, apolice, newVehicles, errors } = this.state
        let frota = [...this.state.frota]

        if (errors && errors[0]) {
            this.setState({ ...this.state, ...checkInputErrors('setState') })
            return
        }
        if (!seguradora || seguradora === '') {
            this.setState({ openAlertDialog: true, alertType: 'seguradoraNotFound', seguradora: undefined })
            return
        }
        //Create a new insurance
        if (!insuranceExists) {
            const { seguradoraId, apolice, dataEmissao, vencimento, selectedEmpresa } = this.state

            let cadSeguro = {
                apolice,
                seguradora_id: seguradoraId,
                delegatario_id: selectedEmpresa.delegatarioId
            }

            const validEmissao = moment(dataEmissao, 'YYYY-MM-DD', true).isValid(),
                validVenc = moment(vencimento, 'YYYY-MM-DD', true).isValid()

            if (validEmissao) cadSeguro.data_emissao = dataEmissao
            if (validVenc) cadSeguro.vencimento = vencimento

            await axios.post('/api/cadSeguro', cadSeguro)
        }

        //Define body to post
        const body = {
            table: 'veiculo',
            column: 'apolice',
            value: apolice,
            tablePK: 'veiculo_id',
            ids: newVehicles
        }

        await axios.put('/api/updateInsurances', body)
            .then(res => console.log(res.data))
        //await axios.get('/api/seguros')

        frota = frota.map(v => {
            newVehicles.forEach(id => {
                if (v.veiculoId === id) {
                    v.apolice = apolice
                    return v
                } else return v
            })
            return v
        })

        this.toast()
        this.submitFiles()
        this.clearFields()
        this.setState({ newPlates: [], newVehicles: [], frota })
    }

    handleFiles = async file => {
        let formData = new FormData()
        formData.append('seguro', file[0])
        await this.setState({ dropDisplay: file[0].name, seguroFile: formData })
    }

    submitFiles = async () => {
        const { apolice, selectedEmpresa } = this.state

        let seguroFormData = new FormData()

        if (this.state.seguroFile) {
            seguroFormData.append('fieldName', 'seguro')
            seguroFormData.append('apolice', apolice)
            seguroFormData.append('empresaId', selectedEmpresa.delegatarioId)
            for (let pair of this.state.seguroFile.entries()) {
                seguroFormData.append(pair[0], pair[1])
            }
            await axios.post('/api/empresaUpload', seguroFormData)
                .then(r => console.log(r.data))
            this.toast()
        }
    }

    toast = () => this.setState({ confirmToast: !this.state.confirmToast })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    clearFields = () => {
        this.setState({
            insuranceExists: '', seguradora: '', newInsurance: '',
            apolice: '', dataEmissao: '', vencimento: '', seguroFile: null,
            dropDisplay: 'Clique ou arraste para anexar a apólice'
        })
    }

    render() {
        const { openAlertDialog, alertType } = this.state
        const enableAddPlaca = seguroForm
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        return (
            <Fragment>
                <AltSeguroTemplate
                    data={this.state}
                    enableAddPlaca={enableAddPlaca}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    addPlate={this.addPlate}
                    deleteInsurance={this.deleteInsurance}
                    handleFiles={this.handleFiles}
                    handleSubmit={this.handleSubmit}
                />
                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customMessage={this.state.customMsg} />}
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
            </Fragment>
        )
    }
}

const collections = ['veiculos', 'empresas', 'seguradoras', 'seguros']

export default connect(null, { removeInsurance, updateCollection })(StoreHOC(collections, AltSeguro))