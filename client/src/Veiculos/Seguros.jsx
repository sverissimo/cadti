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
            s = [...seguros.filter(se => se.codigoEmpresa === selectedEmpresa.codigoEmpresa)]

        let insurance = { ...s.find(s => s[name] === inputValue) }

        if (demand && this.state.insurance)
            insurance = this.state.insurance

        const insuranceExists = Object.keys(insurance).length > 0

        if (insuranceExists) {
            const
                dataEmissao = moment(insurance.dataEmissao).format('YYYY-MM-DD'),
                vencimento = moment(insurance.vencimento).format('YYYY-MM-DD'),
                { seguradora, seguradoraId } = insurance
            console.log(seguradoraId)
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
                codigoEmpresa: selectedEmpresa.codigoEmpresa,
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

        //Create seguro object e checar datas
        const
            cadSeguro = {
                apolice,
                seguradora_id: seguradoraId,
                codigo_empresa: selectedEmpresa.codigoEmpresa
            },
            emis = moment(dataEmissao, 'YYYY-MM-DD', true),
            venc = moment(vencimento, 'YYYY-MM-DD', true),
            validEmissao = emis.isValid(),
            validVenc = venc.isValid(),
            invalido = venc.isSameOrBefore(emis, 'day'),
            vencido = venc.isBefore(moment(), 'day'),
            pendente = emis.isAfter(moment(), 'day'),
            vigente = emis.isSameOrBefore(moment(), 'day')

        if (invalido) {
            alert('A data de vencimento informada é anterior ao início da vigência.')
            return
        }
        if (vencido) {
            alert('O seguro informado está vencido.')
            return
        }
        if (pendente)
            cadSeguro.situacao = 'Aguardando início da vigência'
        if (vigente)
            cadSeguro.situacao = 'Vigente'
        if (validEmissao)
            cadSeguro.data_emissao = dataEmissao
        if (validVenc)
            cadSeguro.vencimento = vencimento

        //*******************Create a new demand
        if (!demand) {
            // New or existing, insurance will be in state if the all fields are filled and update every plate added or removed.
            if (insurance)
                vehicleIds = insurance.veiculos

            let { codigoEmpresa, ...seguro } = cadSeguro
            seguro.seguradora = seguradora
            seguro = humps.camelizeKeys(seguro)

            const log = {
                empresaId: selectedEmpresa?.codigoEmpresa,
                history: {
                    ...seguro,
                    vehicleIds,
                    files: apoliceDoc
                },
                demandFiles,
                metadata: {
                    fieldName: 'apoliceDoc',
                    apolice,
                    empresaId: selectedEmpresa?.codigoEmpresa,
                },
                historyLength: 0,
                approved
            }
            //Registrar os veiculos apagados pela demanda
            if (deletedVehicles[0])
                log.history.deletedVehicles = deletedVehicles

            logGenerator(log)
            this.confirmAndResetState('Solicitação de cadastro de seguro enviada')
            return
        }

        //Se a demanda já existe e for indeferida
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
        //Aprovar demanda
        if (approved === true) {
            this.approveInsurance(cadSeguro)
        }
    }

    approveInsurance = async cadSeguro => {
        const
            { seguros } = this.props.redux,
            { apolice, vencimento, dataEmissao, seguradoraId, insurance, demand, demandFiles } = this.state,
            vehicleIds = insurance.veiculos

        //****************************** Cria o body para os requests****************************** */
        const body = {
            table: 'veiculos',
            column: 'apolice',
            value: apolice,
            tablePK: 'veiculo_id',
            ids: vehicleIds
        }
        //********************************** CREATE/UPDATE INSURANCE **********************************
        const insuranceExists = seguros.find(s => s.apolice === apolice)
        let cadSeguroOk

        if (insuranceExists) {
            const
                de = moment(insuranceExists.dataEmissao).isSame(moment(dataEmissao)),
                v = moment(insuranceExists.vencimento).isSame(moment(vencimento)),
                vExists = JSON.stringify(vehicleIds) === JSON.stringify(insuranceExists.veiculos)

            //Evitar seguro repetido de ser cadastrado
            if (de && v && vExists) {
                this.setState({
                    openAlertDialog: true,
                    customTitle: 'Seguro existente',
                    customMsg: 'O seguro informado já existe no sistema. Para cadastrar um novo seguro, altere o número da apólice, ou as datas de emissão e vencimento.'
                })
                return
            }
            //Se o seguro novo tiver o mesmo número de apólice e já estiver vigente, apenas atualiza o registro do Postgresql
            if (cadSeguro.situacao === 'Vigente') {
                let updates = { dataEmissao, vencimento, seguradoraId }
                updates = humps.decamelizeKeys(updates)
                const
                    columns = Object.keys(updates),
                    requestObj = {
                        id: insuranceExists?.id,
                        vehicleIds,
                        columns,
                        updates,
                    }
                axios.put('/api/updateInsurance', { ...requestObj })
            }
        }

        //Se as datas forem diferentes, se trata de cadastrar um novo seguro, ainda que o número da apólice seja o mesmo (caso insuranceExists === true ou false)
        if (cadSeguro.situacao === 'Aguardando início da vigência') {
            cadSeguro.veiculos = vehicleIds
            console.log({ ...cadSeguro })
            await axios.post('/api/cadSeguroMongo', { ...cadSeguro })
        }
        //Se o seguro cadastrado já estiver vigente já cadastra direto no Postgrtesql (tabela seguros) e atualiza a tabela de veículos
        if (cadSeguro.situacao === 'Vigente' && !insuranceExists) {
            console.log('vigente, ', cadSeguro)
            await axios.post('/api/cadSeguro', cadSeguro)
                .then(r => {
                    if (r.status === 200)
                        cadSeguroOk = true
                    console.log(r.status, cadSeguroOk)
                })
        }
        //A atualização dos veículos só ocorre se o seguro for cadastrado com sucesso
        if ((cadSeguroOk && !insuranceExists) || cadSeguro.situacao === 'Vigente')
            await axios.put('/api/updateInsurances', body)
                .then(res => {
                    console.log(res.data)
                    this.setState({ dontUpdateProps: true })
                })

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
            { openAlertDialog, alertType, openAddDialog, showAllPlates, allPlates, allPlatesObj, selectAll, customTitle, customMsg } = this.state,
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

                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customTitle={customTitle} customMessage={customMsg} />}
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
            </Fragment>
        )
    }
}

const collections = ['veiculos', 'empresas', 'seguradoras', 'seguros', 'getFiles/empresaDocs']

export default StoreHOC(collections, Seguro)