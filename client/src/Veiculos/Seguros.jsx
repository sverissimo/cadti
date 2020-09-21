import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import StoreHOC from '../Store/StoreHOC'

import ReactToast from '../Reusable Components/ReactToast'
import moment from 'moment'
import { sizeExceedsLimit } from '../Utils/handleFiles'
import SeguroTemplate from './SegurosTemplate'
import ShowAllPlates from './ShowAllPlates'
import ConfigAddDialog from './ConfigAddDialog'
import { checkInputErrors } from '../Utils/checkInputErrors'
import AlertDialog from '../Reusable Components/AlertDialog'
import { seguroForm } from '../Forms/seguroForm'
import { logGenerator } from '../Utils/logGenerator'
import { setEmpresaDemand } from '../Utils/setEmpresaDemand'
import { removeFile } from '../Utils/handleFiles'


class Seguro extends Component {

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
        razaoSocial: '',
        seguradora: '',
        deletedVehicles: [],
        toastMsg: 'Seguro atualizado!',
        confirmToast: false,
        dropDisplay: 'Clique ou arraste para anexar a apólice',
        showAllPlates: false,
        showPendencias: false,
        selectAll: false
    }

    async componentDidMount() {
        const
            { redux } = this.props,
            demand = this.props?.location?.state?.demand

        if (demand) {
            const
                demandState = setEmpresaDemand(demand, redux, []),
                { latestDoc, newMembers, oldMembers, filteredSocios, ...filteredState } = demandState,
                history = demand?.history[0],
                insurance = {}

            seguroForm.forEach(({ field }) => {
                if (history.hasOwnProperty(field))
                    insurance[field] = history[field]
            })

            const insuranceVehicles = redux.veiculos
                .filter(v => history.vehicleIds.some(id => id === v.veiculoId))

            insurance.placas = insuranceVehicles.map(v => v.placa)
            insurance.veiculos = insuranceVehicles.map(v => v.veiculoId)

            const seguradoraId = history?.seguradoraId

            await this.setState({
                ...this.state, ...filteredState, ...insurance, insurance, demand, seguradoraId,
                razaoSocial: demand?.empresa, demandFiles: [latestDoc]
            })

            this.filterInsurances()
        }
        document.addEventListener('keydown', this.escFunction, false)
    }

    filterInsurances = () => {
        const
            { veiculos, seguros } = this.props.redux,
            { razaoSocial } = this.state,
            frota = veiculos.filter(v => v.empresa === razaoSocial),
            filteredInsurances = seguros.filter(seguro => seguro.empresa === razaoSocial),
            allPlates = frota.map(vehicle => vehicle.placa).sort()
        //console.log(frota, filteredInsurances, allPlates)
        this.setState({ frota, seguros: filteredInsurances, allPlates })
    }

    checkExistance = async (name, inputValue) => {

        const
            seguros = JSON.parse(JSON.stringify(this.props.redux.seguros)),
            { selectedEmpresa, demand } = this.state,
            s = [...seguros.filter(se => se.delegatarioId === selectedEmpresa.delegatarioId)]

        let insurance = { ...s.find(s => s[name] === inputValue) }

        if (demand && this.state.insurance)
            insurance = this.state.insurance

        const insuranceExists = Object.keys(insurance).length > 0

        if (insuranceExists) {
            const
                dataEmissao = moment(insurance.dataEmissao).format('YYYY-MM-DD'),
                vencimento = moment(insurance.vencimento).format('YYYY-MM-DD'),
                { seguradora, seguradoraId } = insurance

            await this.setState({ seguradora, seguradoraId, dataEmissao, vencimento, insurance })
            return
        }
        else this.setState({ dataEmissao: '', vencimento: '', deletedVehicles: [], insurance: {} })
    }

    handleInput = async e => {

        let { value } = e.target
        const
            { name } = e.target,
            { empresas, seguradoras } = this.props.redux,
            { selectedEmpresa, frota, insurance, apolice, dataEmissao,
                vencimento, newInsurance, seguradora } = this.state

        this.setState({ [name]: value })

        switch (name) {
            case 'razaoSocial':
                let selectedEmpresa = empresas.find(e => e.razaoSocial === value)

                if (selectedEmpresa) {
                    await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                    if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })
                    this.filterInsurances()

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

        if (name !== 'razaoSocial' && !newInsurance && checkFields && !insurance) {
            let seguradoraId
            const selectedSeguradora = seguradoras.find(sg => sg.seguradora === this.state.seguradora)
            if (selectedSeguradora) seguradoraId = selectedSeguradora.id

            const newInsurance = {
                empresa: selectedEmpresa.razaoSocial,
                delegatarioId: selectedEmpresa.delegatarioId,
                apolice, seguradora, seguradoraId, dataEmissao, vencimento, placas: [], veiculos: []
            }
            await this.setState({ insurance: newInsurance, seguradoraId })
        }
    }

    handleBlur = e => {

        const
            { seguradoras, seguros } = this.props.redux,
            { seguradora, selectedEmpresa } = this.state,
            { name } = e.target

        if (name === 'seguradora') {
            let filteredInsurances = []

            const valid = seguradoras.find(s => s.seguradora.toLowerCase().match(seguradora.toLowerCase()))
            if (valid && seguradora.length > 2) this.setState({ seguradora: valid.seguradora, seguradoraId: valid.id })
            if (!valid && seguradora.length > 2) this.setState({ openAlertDialog: true, alertType: 'seguradoraNotFound', seguradora: undefined })

            if (selectedEmpresa && !seguradora) {
                filteredInsurances = seguros.filter(seguro => seguro.empresa === selectedEmpresa.razaoSocial)
                this.setState({ seguros: filteredInsurances })
            }
            else if (!selectedEmpresa && seguradora !== '') {
                filteredInsurances = seguros.filter(s => s.seguradora === seguradora)
                this.setState({ seguros: filteredInsurances })
            }
            else if (selectedEmpresa && seguradora !== '') {
                filteredInsurances = seguros
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

    selectAllPlates = () => {
        const
            { allPlates, selectAll } = this.state,
            updatedState = {}

        if (allPlates) {
            allPlates.forEach(p => {

                if (selectAll) {
                    updatedState[p] = false
                    this.removeFromInsurance(p)
                } else {
                    updatedState[p] = true
                    this.addPlate(p, true)
                }
            })
        }
        this.setState({ selectAll: !selectAll, allPlatesObj: updatedState })
    }

    addPlate = async (placaInput, allSelected) => {

        const
            { apolice, frota, deletedVehicles, insurance } = this.state,
            vehicleFound = frota.find(v => v.placa === placaInput)

        if (!placaInput || placaInput === '') return

        //Check if vehicle belongs to frota before add to insurance and  if plate already belongs to apolice
        if (vehicleFound === undefined || vehicleFound.hasOwnProperty('veiculoId') === false) {
            this.setState({ openAlertDialog: true, alertType: 'plateNotFound' })
            return null
        } else if (insurance && insurance.placas && vehicleFound.placa && !allSelected) {
            const check = insurance.placas.find(p => p === vehicleFound.placa)
            if (check) {
                this.setState({ openAlertDialog: true, alertType: 'plateExists' })
                return null
            }
        }
        // Add plates to rendered list
        if (apolice && insurance) {
            const
                update = { ...insurance },
                { veiculoId } = vehicleFound

            if (!update.placas) update.placas = []
            if (!update.veiculos) update.veiculos = []

            if (!update.placas.includes(placaInput))
                update.placas.push(placaInput)
            if (!update.veiculos.includes(veiculoId))
                update.veiculos.push(veiculoId)

            //Remove from state.deletedVehicles if its the case
            if (deletedVehicles.includes(veiculoId)) {
                const i = deletedVehicles.indexOf(veiculoId)
                deletedVehicles.splice(i, 1)
            }
            this.setState({ insurance: update, addedPlaca: '', deletedVehicles })
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

            if (!deletedVehicles.includes(veiculos[k])) {
                deletedVehicles.push(veiculos[k])

                this.setState({ deletedVehicles })
            }
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

        if (!emissaoDidChange && !vencimentoDidChange && seguradoraDidChange) return null

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

    handleSubmit = async approved => {

        const { seguradora, insurance, errors, deletedVehicles, seguradoraId, apolice, newElement,
            dataEmissao, vencimento, selectedEmpresa, demand, demandFiles, apoliceDoc, info } = this.state

        let vehicleIds = []

        if (errors && errors[0]) {
            this.setState({ ...this.state, ...checkInputErrors('setState') })
            return
        }
        if (!seguradora || seguradora === '') {
            this.setState({ openAlertDialog: true, alertType: 'seguradoraNotFound', seguradora: undefined })
            return
        }

        //Create seguro object       
        const
            validEmissao = moment(dataEmissao, 'YYYY-MM-DD', true).isValid(),
            validVenc = moment(vencimento, 'YYYY-MM-DD', true).isValid(),
            cadSeguro = {
                apolice,
                seguradora_id: seguradoraId,
                delegatario_id: selectedEmpresa.delegatarioId
            }

        if (validEmissao) cadSeguro.data_emissao = dataEmissao
        if (validVenc) cadSeguro.vencimento = vencimento

        //*******************Create a new demand
        if (!demand) {
            // New or existing, insurance will be in state if the all fields are filled and update every plate added or removed.
            if (insurance)
                vehicleIds = insurance.veiculos

            let { delegatarioId, ...seguro } = cadSeguro
            seguro.seguradora = seguradora
            seguro = humps.camelizeKeys(seguro)

            const log = {
                empresaId: selectedEmpresa?.delegatarioId,
                history: {
                    ...seguro,
                    vehicleIds,
                    files: apoliceDoc
                },
                demandFiles,
                metadata: {
                    fieldName: 'apoliceDoc',
                    apolice,
                    empresaId: selectedEmpresa?.delegatarioId,
                },
                historyLength: 0,
                approved
            }
            if (deletedVehicles[0])                             //Registrar os veiculos apagados pela demanda
                log.history.deletedVehicles = deletedVehicles

            if (newElement && insurance)                       //Se foi mudado o número da apólice, registrar que houve mudança e o id
                log.history = {
                    ...log.history,
                    newElement: true,
                    id: insurance.id
                }
            console.log(log, deletedVehicles)

            logGenerator(log)
            this.confirmAndResetState('Solicitação de cadastro de seguro enviada')
            return
        }

        if (approved === false) {
            const log = {
                id: demand.id,
                history: {
                    info
                },
                declined: true
            }
            logGenerator(log)
                .then(r => console.log(r))
            this.confirmAndResetState('Solicitação indeferida!')
        }

        if (approved === true) {
            this.approveInsurance(cadSeguro)
        }
    }

    approveInsurance = async cadSeguro => {
        const
            { apolice, insurance, deletedVehicles, demand, demandFiles } = this.state,
            vehicleIds = insurance.veiculos,
            { newElement, id } = demand?.history[0]

        //********************************** CREATE/UPDATE INSURANCE **********************************
        const insuranceExists = this.props.redux.seguros.some(s => s.apolice === apolice)
        if (insuranceExists)
            await this.updateInsurance()
        else if (!newElement)
            await axios.post('/api/cadSeguro', cadSeguro)

        //********************************** UPDATE VEHICLES**********************************
        //Se houver mudança no número da apólice, atualizar o banco de dados
        if (newElement && id) {
            const updateApoliceNumber = {
                table: 'seguro',
                tablePK: 'id',
                column: 'apolice',
                requestArray: [{ id, apolice }]
            }
            await axios.put('/api/editElements', { ...updateApoliceNumber })
        }

        //Define o request com array de Ids dos veiculos para atualizar o(s) campo(s) apólice de cada um. 
        const body = {
            table: 'veiculo',
            column: 'apolice',
            value: apolice,
            tablePK: 'veiculo_id',
            ids: vehicleIds
        }
        await axios.put('/api/updateInsurances', body)
            .then(res => {
                console.log(res.data)
                this.setState({ dontUpdateProps: true })
            })

        if (deletedVehicles[0] || demand?.history[0]?.deletedVehicles) {
            const
                previouslyDeleted = demand?.history[0]?.deletedVehicles || [],
                vehiclesToDelete = deletedVehicles.concat(previouslyDeleted)

            body.value = 'Seguro não cadastrado'
            body.ids = vehiclesToDelete
            await axios.put('/api/updateInsurances', body)
        }

        //Cria o log de demanda concluída
        const log = {
            id: demand.id,
            demandFiles,
            history: {},
            metadata: {},
            approved: true
        }
        logGenerator(log)
        this.confirmAndResetState()
    }

    confirmAndResetState = confirmMessage => {
        const { demand } = this.state
        this.toast(confirmMessage)
        this.clearFields()

        if (demand)
            setTimeout(() => {
                this.props.history.push('/solicitacoes')
            }, 1500);
    }

    handleFiles = async files => {
        //limit files Size
        if (sizeExceedsLimit(files)) return

        let formData = new FormData()
        formData.append('apoliceDoc', files[0])
        await this.setState({ apoliceDoc: formData, fileToRemove: null })
    }

    removeFile = async (name) => {
        const
            { apoliceDoc } = this.state,
            newState = removeFile(name, apoliceDoc)

        this.setState({ ...this.state, ...newState })
    }
    addNewElement = () => this.setState({ apolice: this.state.newElement, openAddDialog: false })
    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ openAddDialog: !this.state.openAddDialog })
    toast = toastMsg => this.setState({ confirmToast: !this.state.confirmToast, toastMsg: toastMsg ? toastMsg : this.state.toastMsg })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    clearFields = () => {
        this.setState({
            seguradora: '', insurance: undefined, apolice: '', dataEmissao: '', vencimento: '', apoliceDoc: null, deletedVehicles: [],
            dropDisplay: 'Clique ou arraste para anexar a apólice'
        })
    }

    render() {
        const
            { openAlertDialog, alertType, openAddDialog, showAllPlates, allPlates, allPlatesObj, selectAll } = this.state,
            { empresas, seguradoras, seguros } = this.props.redux

        const enableAddPlaca = seguroForm
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        return (
            <Fragment>
                <SeguroTemplate
                    data={this.state}
                    empresas={empresas}
                    seguros={seguros}
                    seguradoras={seguradoras}
                    enableAddPlaca={enableAddPlaca}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    addPlate={this.addPlate}
                    removeFromInsurance={this.removeFromInsurance}
                    enableChangeApolice={this.toggleDialog}
                    handleFiles={this.handleFiles}
                    handleSubmit={this.handleSubmit}
                    showAllPlates={this.showAllPlates}
                    setShowPendencias={this.setShowPendencias}
                    removeFile={this.removeFile}
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
                        data={allPlatesObj}
                        selectAll={selectAll}
                        selectAllPlates={this.selectAllPlates}
                    />
                }

                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customMessage={this.state.customMsg} />}
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
            </Fragment>
        )
    }
}

const collections = ['veiculos', 'empresas', 'seguradoras', 'seguros', 'getFiles/empresaDocs']

export default StoreHOC(collections, Seguro)