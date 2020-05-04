import React, { Component, Fragment } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'

import ReactToast from '../Utils/ReactToast'
import moment from 'moment'

import AltSeguroTemplate from './AltSeguroTemplate'
import ShowAllPlates from './ShowAllPlates'
import ConfigAddDialog from './ConfigAddDialog'
import { checkInputErrors } from '../Utils/checkInputErrors'
import AlertDialog from '../Utils/AlertDialog'
import { seguroForm } from '../Forms/seguroForm'

class AltSeguro extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.openAddDialog) this.toggleDialog()
                if (this.state.showAllPlates) this.setState({ showAllPlates: false })
            }
        }
    }

    state = {
        addedPlaca: '',
        insurance: {},
        insuranceExists: false,
        razaoSocial: '',
        seguradora: '',
        deletedVehicles: [],
        toastMsg: 'Seguro atualizado!',
        confirmToast: false,
        dropDisplay: 'Clique ou arraste para anexar a apólice',
        showAllPlates: false
    }

    componentDidMount() {
        this.setState({
            seguradoras: this.props.redux['seguradoras'],
            allInsurances: this.props.redux['seguros']
        })
        document.addEventListener('keydown', this.escFunction, false)
    }

    componentDidUpdate(prevProps, prevState) {
        const
            { seguros } = this.props.redux,
            { apolice, insuranceExists, dontUpdateProps } = this.state

        if (prevProps.redux.seguros !== seguros && !dontUpdateProps) {
            console.log('Props updated. DUProps state is:', dontUpdateProps)
            if (insuranceExists) {
                const updatedInsurance = seguros.find(s => s.apolice === apolice)
                this.setState({ insuranceExists: updatedInsurance })
            }
        }
    }

    checkExistance = async (name, inputValue) => {

        const
            seguros = JSON.parse(JSON.stringify(this.props.redux.seguros)),
            { selectedEmpresa } = this.state,
            s = [...seguros.filter(se => se.delegatarioId === selectedEmpresa.delegatarioId)]

        let insurance = { ...s.find(s => s[name] === inputValue) }
        const insuranceExists = Object.keys(insurance).length > 0

        if (insuranceExists) {
            const dataEmissao = moment(insurance.dataEmissao).format('YYYY-MM-DD'),
                vencimento = insurance.vencimento.toString().slice(0, 10),
                { seguradora, seguradoraId } = insurance
            await this.setState({ seguradora, seguradoraId, dataEmissao, vencimento, insurance, insuranceExists })
            return
        }
        else this.setState({ insuranceExists, insurance: {}, dataEmissao: '', vencimento: '', deletedVehicles: [] })
    }

    handleInput = async e => {

        let { value } = e.target
        const
            { name } = e.target,
            { veiculos, empresas, seguradoras } = this.props.redux,
            { allInsurances, selectedEmpresa, frota, insurance, apolice, dataEmissao,
                vencimento, newInsurance, seguradora } = this.state

        this.setState({ [name]: value })

        switch (name) {
            case 'razaoSocial':
                let selectedEmpresa = empresas.find(e => e.razaoSocial === value)

                if (selectedEmpresa) {
                    await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                    if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })
                    const
                        frota = veiculos.filter(v => v.empresa === this.state.razaoSocial),
                        filteredInsurances = allInsurances.filter(seguro => seguro.empresa === this.state.razaoSocial),
                        allPlates = frota.map(vehicle => vehicle.placa).sort()

                    this.setState({ frota, seguros: filteredInsurances, allPlates })

                } else {
                    this.setState({ selectedEmpresa: undefined, frota: [] })
                    this.clearFields()
                }
                break

            case 'apolice':
                this.checkExistance('apolice', value)
                break

            case 'seguradora':
                const selectedSeguradora = seguradoras.find(sg => sg.seguradora === value)
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

        if (name !== 'razaoSocial' && !newInsurance && checkFields && Object.keys(insurance).length === 0) {
            let newInsurance = {}, seguradoraId
            const selectedSeguradora = seguradoras.find(sg => sg.seguradora === this.state.seguradora)
            if (selectedSeguradora) seguradoraId = selectedSeguradora.id

            Object.assign(newInsurance,
                {
                    empresa: selectedEmpresa.razaoSocial,
                    delegatarioId: selectedEmpresa.delegatarioId,
                    apolice, seguradora, seguradoraId, dataEmissao, vencimento, placas: [], veiculos: []
                })

            await this.setState({ insuranceExists: false, insurance: newInsurance, seguradoraId })
        }
    }

    handleBlur = e => {

        const
            { seguradoras } = this.props.redux,
            { seguradora, allInsurances, selectedEmpresa } = this.state,
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
    showAllPlates = () => {
        const { insurance, allPlates } = this.state
        let placas = [], allPlatesObj = {}

        if (insurance && insurance.placas) placas = insurance.placas

        allPlates.forEach(p => Object.assign(allPlatesObj, { [p]: false }))
        placas.forEach(p => Object.assign(allPlatesObj, { [p]: true }))

        this.setState({ allPlatesObj, insuredPlates: placas, showAllPlates: !this.state.showAllPlates })
    }

    handleCheck = async plate => {

        let allPlatesObj = { ...this.state.allPlatesObj }
        allPlatesObj[plate] = !allPlatesObj[plate]

        if (allPlatesObj[plate] === true) this.addPlate(plate)
        else this.removeFromInsurance(plate)

        this.setState({ allPlatesObj })
    }

    addPlate = async placaInput => {

        const
            { apolice, frota } = this.state,
            vehicleFound = frota.find(v => v.placa === placaInput)
        let
            { insuranceExists, insurance } = this.state

        if (!placaInput || placaInput === '') return

        //Check if vehicle belongs to frota before add to insurance and  if plate already belongs to apolice
        if (vehicleFound === undefined || vehicleFound.hasOwnProperty('veiculoId') === false) {
            this.setState({ openAlertDialog: true, alertType: 'plateNotFound' })
            return null
        } else if (insuranceExists === true && insurance.placas && vehicleFound.placa) {
            const check = insurance.placas.find(p => p === vehicleFound.placa)
            if (check) {
                this.setState({ openAlertDialog: true, alertType: 'plateExists' })
                return null
            }
        }
        // Add plates to rendered list
        if (apolice) {

            let update = { ...insurance }

            if (!update.placas) update.placas = []
            if (!update.veiculos) update.veiculos = []

            update.placas.push(placaInput)
            update.veiculos.push(vehicleFound.veiculoId)

            this.setState({ insurance: update, addedPlaca: '' })
        }
    }

    removeFromInsurance = async placaInput => {

        const
            { apolice, frota } = this.state,
            vehicleFound = frota.find(v => v.placa === placaInput),
            { veiculoId, placa } = vehicleFound

        let
            insurance = { ...this.state.insurance },
            deletedVehicles = [...this.state.deletedVehicles],
            placas = [], veiculos = [],
            check

        const seg = this.props.redux.seguros.find(s => s.apolice === apolice)
        if (seg && seg.placas) check = seg.placas.includes(placa)

        if (check) {
            let { veiculos } = insurance
            const k = veiculos.indexOf(veiculoId)
            deletedVehicles.push(veiculos[k])
            this.setState({ deletedVehicles })
        }

        if (insurance.placas) placas = insurance.placas
        if (insurance.veiculos) veiculos = insurance.veiculos

        const
            i = placas.indexOf(placa),
            k = veiculos.indexOf(veiculoId)

        insurance.placas.splice(i, 1)
        insurance.veiculos.splice(k, 1)

        this.setState({ insurance })
    }

    updateInsurance = () => {
        const
            { insurance, dataEmissao, vencimento, seguradoraId } = this.state,
            { id, veiculos } = insurance


        let updates = {}
        const
            emissaoDidChange = !moment(dataEmissao).isSame(moment(insurance.dataEmissao)),
            vencimentoDidChange = !moment(vencimento).isSame(moment(insurance.vencimento)),
            seguradoraDidChange = seguradoraId !== insurance.seguradoraId

        if (!emissaoDidChange && !vencimentoDidChange && seguradoraDidChange) return

        if (emissaoDidChange) updates.data_emissao = dataEmissao
        if (vencimentoDidChange) updates.vencimento = vencimento
        if (seguradoraDidChange) updates.seguradora_id = seguradoraId

        const requestObj = {
            id,
            columns: Object.keys(updates),
            updates,
            vehicleIds: veiculos
        }
        axios.put('/api/updateInsurance', requestObj)
            .then(r => console.log(r.data))
    }

    handleSubmit = async () => {

        const { seguradora, insuranceExists, insurance, errors, newElement, deletedVehicles } = this.state

        let
            frota = [...this.state.frota],
            vehicleIds = []

        if (errors && errors[0]) {
            this.setState({ ...this.state, ...checkInputErrors('setState') })
            return
        }
        if (!seguradora || seguradora === '') {
            this.setState({ openAlertDialog: true, alertType: 'seguradoraNotFound', seguradora: undefined })
            return
        }

        //Create seguro object
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

        //Create a new insurance
        if (!insuranceExists) {
            if (insurance) vehicleIds = insurance.veiculos
            await axios.post('/api/cadSeguro', cadSeguro)
        }
        //else just update the insurer and/or dates
        if (insuranceExists) {
            vehicleIds = insurance.veiculos
            await this.updateInsurance()
        }

        //Define body and post VehicleUpdate
        let body = {
            table: 'veiculo',
            column: 'apolice',
            value: apolice,
            tablePK: 'veiculo_id',
            ids: vehicleIds
        }

        if (newElement && insuranceExists && insurance.id) {
            axios.put('/api/changeApoliceNumber', { id: insurance.id, newApoliceNumber: newElement })
        }

        await axios.put('/api/updateInsurances', body)
            .then(res => {
                console.log(res.data)
                this.setState({ dontUpdateProps: true })
            })
        if (deletedVehicles) {
            body.value = 'Seguro não cadastrado'
            body.ids = deletedVehicles
            await axios.put('/api/updateInsurances', body)
        }

        frota = frota.map(v => {
            vehicleIds.forEach(id => {
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
        this.setState({ frota })
    }

    handleFiles = async file => {
        let formData = new FormData()
        formData.append('apoliceDoc', file[0])
        await this.setState({ dropDisplay: file[0].name, seguroFile: formData })
    }

    submitFiles = async () => {
        const { apolice, selectedEmpresa } = this.state

        let seguroFormData = new FormData()

        if (this.state.seguroFile) {
            seguroFormData.append('fieldName', 'apoliceDoc')
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


    addNewElement = () => this.setState({ apolice: this.state.newElement, openAddDialog: false })
    toggleDialog = () => this.setState({ openAddDialog: !this.state.openAddDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    clearFields = () => {
        this.setState({
            insuranceExists: false, seguradora: '', insurance: {},
            apolice: '', dataEmissao: '', vencimento: '', seguroFile: null, deletedVehicles: [],
            dropDisplay: 'Clique ou arraste para anexar a apólice'
        })
    }

    render() {
        const
            { openAlertDialog, alertType, openAddDialog, showAllPlates, allPlates, allPlatesObj } = this.state,
            { empresas } = this.props.redux

        const enableAddPlaca = seguroForm
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        return (
            <Fragment>
                <AltSeguroTemplate
                    data={this.state}
                    empresas={empresas}
                    enableAddPlaca={enableAddPlaca}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    addPlate={this.addPlate}
                    removeFromInsurance={this.removeFromInsurance}
                    enableChangeApolice={this.toggleDialog}
                    handleFiles={this.handleFiles}
                    handleSubmit={this.handleSubmit}
                    showAllPlates={this.showAllPlates}
                />
                {openAddDialog && <ConfigAddDialog
                    open={openAddDialog}
                    close={this.toggleDialog}
                    title='Alterar número da apólice'
                    helperMessage='Informe o número atualizado da apólice.'
                    handleInput={this.handleInput}
                    addNewElement={this.addNewElement}
                />}
                {
                    showAllPlates &&
                    <ShowAllPlates
                        items={allPlates}
                        close={this.showAllPlates}
                        title='Selecione as placas para adicionar à apólice.'
                        handleCheck={this.handleCheck}
                        data={allPlatesObj} />
                }

                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customMessage={this.state.customMsg} />}
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
            </Fragment>
        )
    }
}

const collections = ['veiculos', 'empresas', 'seguradoras', 'seguros']

export default StoreHOC(collections, AltSeguro)