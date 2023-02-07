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
            demand = this.props?.location?.state?.demand,
            { empresas, veiculos } = redux

        if (empresas && empresas.length === 1) {
            await this.setState({ selectedEmpresa: empresas[0], razaoSocial: empresas[0]?.razaoSocial, frota: veiculos })
            this.filterInsurances()
        }

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

            await this.setState({ ...this.state, ...filteredState, ...insurance, insurance, demand, seguradoraId, demandFiles: [latestDoc] })

            await this.filterInsurances()
            this.renderPlacas()
        }
        document.addEventListener('keydown', this.escFunction, false)
    }
    //Se uma viação válida estiver selecionada, filtra sua frota e os veículos que apesar de não possuir os tem na apólice de seguro
    filterInsurances = async () => {
        const
            { seguros } = this.props.redux,
            { selectedEmpresa } = this.state,
            { codigoEmpresa } = selectedEmpresa,
            filteredInsurances = seguros.filter(seguro => seguro.codigoEmpresa === codigoEmpresa),
            dataFromServer = await axios.get(`/api/allVehicles?codigoEmpresa=${codigoEmpresa}`),
            allVehicles = humps.camelizeKeys(dataFromServer?.data) || [],
            allPlates = allVehicles.map(vehicle => vehicle.placa).sort(),
            frota = allVehicles.filter(v => v.codigoEmpresa === codigoEmpresa),
            ownedPlacas = frota.map(v => v.placa)

        this.setState({ seguros: filteredInsurances, allVehicles, frota, ownedPlacas, allPlates })
    }

    //Verifica se o seguro já existe e preenche os campos automaticamente (plain obj to state)
    checkExistence = async inputValue => {

        const
            seguros = JSON.parse(JSON.stringify(this.props.redux.seguros)),
            { selectedEmpresa, demand } = this.state,
            { codigoEmpresa } = selectedEmpresa,
            s = [...seguros.filter(se => se.codigoEmpresa === codigoEmpresa)]

        let insurance = { ...s.find(s => s.apolice === inputValue) }

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

    //Marca as placas que possuem compartilhamento por outra empresa. Acionado ao se informar a apólice (caso já exista)
    renderPlacas = placas => {
        const { allVehicles, insurance, ownedPlacas } = this.state

        if (insurance) {
            //Se passar as placas como argumento se trata do filtro do searchBar. Senão é a renderização depois de preencher a apólice
            if (!placas)
                placas = insurance.placas

            let renderedPlacas = []

            if (placas) {
                placas.forEach(p => {
                    const
                        veiculo = allVehicles.find(v => v.placa === p)
                    if (!veiculo) {
                        this.setState({ renderedPlacas })
                        return
                    }
                    const
                        { placa, empresa, compartilhado } = veiculo,
                        vehicleDetails = { placa, owner: empresa, delCompartilhado: compartilhado }
                    //Se o veículo não for próprio
                    if (!ownedPlacas.includes(placa)) {
                        //Se constar com compartilhado de outra viação, está fora da frota da empresa, senão pode estar irregular
                        if (compartilhado)
                            Object.assign(vehicleDetails, { outsider: true })
                        else
                            Object.assign(vehicleDetails, { irregular: true })
                    }
                    //Se o veículo for próprio:
                    else {
                        if (compartilhado)
                            vehicleDetails.compartilhado = true
                        else
                            vehicleDetails.compartilhado = false
                    }
                    renderedPlacas.push(vehicleDetails)
                })

                this.setState({ renderedPlacas })
            }
        }
    }

    handleInput = async e => {
        let { value } = e.target
        const
            { name } = e.target,
            { empresas, seguradoras } = this.props.redux,
            { selectedEmpresa, allVehicles, insurance, apolice, dataEmissao, vencimento, newInsurance, seguradora } = this.state

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
                if (!allVehicles) this.filterInsurances()
                await this.checkExistence(value)
                this.renderPlacas()
                break

            case 'seguradora':
                const selectedSeguradora = seguradoras.find(sg => sg.seguradora === value)
                if (selectedSeguradora) {
                    this.setState({ seguradoraId: selectedSeguradora.id })
                }
                break
            case 'placa':
                let placas = []
                if (insurance?.placas) {
                    if (insurance.placas[0] && insurance.placas[0] !== null)
                        placas = insurance.placas.sort()

                    if (value !== undefined && value.length > 2 && placas[0]) {
                        if (typeof value === 'string')
                            placas = insurance.placas.filter(p => p.toLowerCase().match(value.toLowerCase())).sort()
                        else
                            placas = insurance.placas.filter(p => p.match(value)).sort()
                    }
                    this.renderPlacas(placas)
                }
                break
            case 'addedPlaca':
                const vehicleFound = allVehicles.find(v => v.placa === value)
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
            { name } = e.target,
            codigoEmpresa = selectedEmpresa?.codigoEmpresa

        if (name === 'seguradora') {
            let filteredInsurances = []

            const valid = seguradoras.find(s => s.seguradora.toLowerCase().match(seguradora.toLowerCase()))
            if (valid && seguradora.length > 2)
                this.setState({ seguradora: valid.seguradora, seguradoraId: valid.id })
            if (!valid && seguradora.length > 2)
                this.setState({ openAlertDialog: true, alertType: 'seguradoraNotFound', seguradora: undefined })

            if (selectedEmpresa && !seguradora) {
                filteredInsurances = seguros.filter(s => s.codigoEmpresa === codigoEmpresa)
                this.setState({ seguros: filteredInsurances })
            }
            else if (!selectedEmpresa && seguradora !== '') {
                filteredInsurances = seguros.filter(s => s.seguradora === seguradora)
                this.setState({ seguros: filteredInsurances })
            }
            else if (selectedEmpresa && seguradora !== '') {
                filteredInsurances = seguros
                    .filter(seg => seg.codigoEmpresa === codigoEmpresa)
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

        if (insurance?.placas)
            placas = insurance.placas

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
        if (!placaInput) {
            return
        }

        const { apolice, allVehicles, deletedVehicles, insurance } = this.state
        const vehicleFound = allVehicles.find(v => v.placa === placaInput)

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

            if (!update.placas || !update.placas[0]) update.placas = []
            if (!update.veiculos || !update.veiculos[0]) update.veiculos = []

            if (!update.placas.includes(placaInput))
                update.placas.push(placaInput)
            if (!update.veiculos.includes(veiculoId))
                update.veiculos.push(veiculoId)

            //Remove from state.deletedVehicles if its the case
            if (deletedVehicles.includes(veiculoId)) {
                const i = deletedVehicles.indexOf(veiculoId)
                deletedVehicles.splice(i, 1)
            }
            this.renderPlacas(update?.placas)
            console.log("🚀 ~ file: Seguros.jsx ~ line 374 ~ Seguro ~ addPlate= ~ update", update)
            this.setState({ insurance: update, addedPlaca: '', deletedVehicles })
        }
    }

    removeFromInsurance = async placaInput => {

        const
            { apolice, allVehicles } = this.state,
            vehicleFound = allVehicles.find(v => v.placa === placaInput),
            { veiculoId, placa } = vehicleFound

        let
            insurance = { ...this.state.insurance },
            deletedVehicles = [...this.state.deletedVehicles],
            placas = [],
            veiculos = [],
            check

        const seg = this.props.redux.seguros.find(s => s.apolice === apolice)
        if (seg && seg.placas)
            check = seg.placas.includes(placa)

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

        await this.setState({ insurance })
        this.renderPlacas()
    }

    handleSubmit = async approved => {
        const { insurance, deletedVehicles, seguradoraId, apolice, numeroDae, selectedEmpresa, demand, apoliceDoc, info, dataEmissao, vencimento } = this.state
        const { codigoEmpresa } = selectedEmpresa
        const { veiculos: vehicleIds } = insurance
        const errorsFound = this.checkForErrors(insurance)

        if (errorsFound) {
            return
        }

        const seguro = this.setInsuranceStatus({ apolice, seguradoraId, codigoEmpresa, dataEmissao, vencimento })
        const cadSeguro = humps.decamelizeKeys(seguro)
        cadSeguro.veiculos = vehicleIds

        if (!demand) {
            const log = {
                empresaId: selectedEmpresa?.codigoEmpresa,
                history: {
                    ...humps.camelizeKeys(cadSeguro),
                    seguradora: this.state.seguradora,
                    vehicleIds,
                    info: numeroDae ? `Nº Documento Arrecadação Estadual: ${numeroDae}` : 'Número do DAE não informado',
                    numeroDae,
                    files: apoliceDoc,
                    deletedVehicles
                },
                demandFiles: this.state.demandFiles,
                metadata: {
                    fieldName: 'apoliceDoc',
                    apolice,
                    empresaId: selectedEmpresa?.codigoEmpresa,
                },
                historyLength: 0,
                approved
            }

            await logGenerator(log)
            this.confirmAndResetState('Solicitação de cadastro de seguro enviada')
            return
        }
        if (approved)
            this.approveInsurance(cadSeguro)
        else {
            const log = {
                id: demand.id,
                history: { info },
                declined: true
            }
            logGenerator(log)
            this.confirmAndResetState('Solicitação indeferida!')
        }
    }

    checkForErrors(insurance) {
        const { errors, seguradora } = this.state
        //Checar erros de preenchimento ou campos vazios
        if (errors && errors[0]) {
            this.setState({ ...this.state, ...checkInputErrors('setState') })
            return true
        }
        if (!seguradora || seguradora === '') {
            this.setState({ openAlertDialog: true, alertType: 'seguradoraNotFound', seguradora: undefined })
            return true
        }
        if (!insurance?.veiculos || !insurance.veiculos[0]) {
            this.setState({
                openAlertDialog: true, customTitle: 'Nenhum veículo inserido',
                customMsg: 'Não foi inserido nenhum veículo para o seguro informado. Para inserir, digite a placa no campo "Insira a placa" ou clique para selecionar a(s) placa(s) do(s) veículo(s) coberto(s) por esse seguro.'
            })
            return true
        }
    }

    setInsuranceStatus(cadSeguro) {
        const
            { dataEmissao, vencimento } = cadSeguro
            , emis = moment(dataEmissao, 'YYYY-MM-DD', true)
            , venc = moment(vencimento, 'YYYY-MM-DD', true)
            , validEmissao = emis.isValid()
            , validVenc = venc.isValid()
            , invalido = venc.isSameOrBefore(emis, 'day')
            , vencido = venc.isBefore(moment(), 'day')
            , pendente = emis.isAfter(moment(), 'day')
            , vigente = emis.isSameOrBefore(moment(), 'day')

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
            cadSeguro.dataEmissao = dataEmissao
        if (validVenc)
            cadSeguro.vencimento = vencimento

        return cadSeguro
    }

    approveInsurance = async (cadSeguro) => {
        const { seguros } = this.props.redux
        const { apolice, vencimento, dataEmissao, seguradoraId, insurance, demand, demandFiles } = this.state
        const { deletedVehicles } = demand.history[0]
        const vehicleIds = insurance.veiculos || demand.history[0].vehicleIds
        const insuranceExists = seguros.find(s => s.apolice === apolice)

        if (insuranceExists) {
            const sameEmitDate = moment(insuranceExists.dataEmissao).isSame(moment(dataEmissao))
            const sameExpireDate = moment(insuranceExists.vencimento).isSame(moment(vencimento))
            const sameVehicles = JSON.stringify(vehicleIds) === JSON.stringify(insuranceExists.veiculos)

            if (sameEmitDate && sameExpireDate && sameVehicles) {
                this.setState({
                    openAlertDialog: true,
                    customTitle: 'Seguro existente',
                    customMsg: 'O seguro informado já existe no sistema. Para cadastrar um novo seguro, altere o número da apólice, ou as datas de emissão e vencimento.'
                })
                return
            }

            if (cadSeguro.situacao === 'Vigente') {
                const update = humps.decamelizeKeys({
                    apolice,
                    seguradoraId,
                    dataEmissao,
                    vencimento,
                    id: insuranceExists?.id,
                    situacao: cadSeguro.situacao,
                })
                await axios.put('/api/seguros', { update, vehicleIds, deletedVehicleIds: deletedVehicles })
                    .catch(e => console.error(e))
                const log = {
                    id: demand.id,
                    demandFiles,
                    history: {},
                    metadata: {},
                    approved: true
                }
                logGenerator(log)
                this.confirmAndResetState()
                return
            }
        }
        //Se as datas forem diferentes, se trata de cadastrar um novo seguro no MongoDB, ainda que o número da apólice seja o mesmo (caso insuranceExists === true ou false)

        let cadSeguroRoute

        if (cadSeguro.situacao === 'Aguardando início da vigência') {
            cadSeguroRoute = '/api/upcomingInsurances'
        } else if (cadSeguro.situacao === 'Vigente' && !insuranceExists) {
            cadSeguroRoute = '/api/seguros'
        }

        await axios.post(cadSeguroRoute, cadSeguro)

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
    clearFields = async () => {
        const
            { empresas, veiculos } = this.props.redux,
            cleanedUpState = {
                seguradora: '', insurance: undefined, apolice: '', dataEmissao: '', vencimento: '',
                apoliceDoc: null, deletedVehicles: [], dropDisplay: 'Clique ou arraste para anexar a apólice'
            },
            empresaDetails = { selectedEmpresa: empresas[0], razaoSocial: empresas[0]?.razaoSocial, frota: veiculos }
        //Se tiver só uma empresa, mantém os dados dela no state após o submit
        if (empresas && empresas.length === 1) {
            await this.setState({ ...cleanedUpState, ...empresaDetails })
            this.filterInsurances()
        }
        else if (empresas)
            this.setState({ ...cleanedUpState })
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

                {
                    openAlertDialog &&
                    <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customTitle={customTitle} customMessage={customMsg} />
                }
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
            </Fragment>
        )
    }
}

const collections = ['veiculos', 'empresas', 'seguradoras', 'seguros', 'getFiles/empresaDocs']

export default StoreHOC(collections, Seguro)