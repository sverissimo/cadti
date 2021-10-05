import React, { PureComponent, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import { setDemand } from '../Utils/setDemand'
import { handleFiles, removeFile } from '../Utils/handleFiles'
import { logGenerator } from '../Utils/logGenerator'

import CadVeiculoTemplate from './CadVeiculoTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './VehicleReview'

import Crumbs from '../Reusable Components/Crumbs'
import StepperButtons from '../Reusable Components/StepperButtons'
import CustomStepper from '../Reusable Components/Stepper'
import ReactToast from '../Reusable Components/ReactToast'

import { formatMoney } from '../Utils/formatValues'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { cadVehicleForm } from '../Forms/cadVehicleForm'

import AlertDialog from '../Reusable Components/AlertDialog'
import validateDist from '../Utils/validaDistanciaMinima'
import { dischargedForm } from '../Forms/dischargedForm'
import checkWeight, { getCMT } from './checkWeight'

class VeiculosContainer extends PureComponent {
    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27 && this.state.addEquipa)
                this.closeEquipa()
        }
    }

    state = {
        activeStep: 0,
        steps: ['Dados do Veículo', 'Vistoria e laudos', 'Documentos', 'Revisão'],
        subtitle: ['Informe os dados do veículo.', 'Preencha os campos abaixo conforme a vistoria realizada'],
        razaoSocial: '',
        frota: [],
        delegatarioCompartilhado: '',
        toastMsg: 'Veículo cadastrado!',
        confirmToast: false,
        addEquipa: false,
        openAlertDialog: false,
        dropDisplay: 'Clique ou arraste para anexar'
    }

    async componentDidMount() {

        const
            { redux } = this.props,
            { equipamentos, acessibilidade, empresas, veiculos } = redux,
            demand = this.props?.location?.state?.demand

        if (empresas && empresas.length === 1)
            this.setState({ selectedEmpresa: empresas[0], razaoSocial: empresas[0]?.razaoSocial, frota: veiculos })

        if (demand) {
            let
                reactivated = false
                , existingPendencias
            const
                demandState = setDemand(demand, redux),
                numeroDae = demand?.history && demand.history.reverse().find(e => e.hasOwnProperty('numeroDae'))?.numeroDae

            console.log("🚀 ~ file: CadVeiculo.jsx ~ line 75 ~ VeiculosContainer ~ componentDidMount ~ demandState", demandState)
            //Adiciona existência de situações específicas no state: pendências ou reativação.
            if (demand.status.match('Pendências')) {
                existingPendencias = true
                demandState.obs = undefined
            }
            if (demandState.situacao.match('Reativação'))
                reactivated = true

            this.setState({ ...demandState, numeroDae, activeStep: 3, reactivated, existingPendencias })
        }

        //*********Create state[equipamento] for each equipamentos/acessibilidade and turn them to false before a vehicle is selected *********/
        //Se tiver demanda, os equipamentos e acessibilidade são definidos no dataActions para incorporar no estado global
        let
            allEqs = {},
            allAcs = {}

        equipamentos.forEach(e => Object.assign(allEqs, { [e?.item]: false }))
        acessibilidade.forEach(e => Object.assign(allAcs, { [e?.item]: false }))

        await this.setState({ ...allEqs, ...allAcs })
        //await this.setState({ ...allEqs, ...allAcs, selectedEmpresa: redux.empresas[0], razaoSocial: 'what' })

        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() {
        this.setState({})
        document.removeEventListener('keydown', this.escFunction, false)
    }

    setActiveStep = async action => {

        if (this.state.activeStep === 0) {
            const matchPlaca = this.state.frota.filter(v => v.placa === this.state.placa)[0]
            if (matchPlaca) {
                await this.setState({ placa: '' });
                this.setState({ alertType: 'plateExists', openAlertDialog: true })
                return null
            }
        }

        //Validação de campos em branco ou inválidos
        const { inputValidation } = this.props.redux.parametros[0] && this.props.redux.parametros[0]

        if (action === 'next' && inputValidation) {
            const
                { checkBlankInputs, checkInputErrors } = this.props
                , errors = checkInputErrors('sendState')
                , blankFields = checkBlankInputs(cadVehicleForm[this.state.activeStep], this.state)
            console.log("🚀 ~ file: CadVeiculo.jsx ~ line 120 ~ VeiculosContainer ~ errors", errors)

            if (errors) {
                this.setState({ ...this.state, ...errors })
                return
            }
            if (blankFields) {
                this.setState({ ...this.state, ...blankFields })
                return
            }

        }

        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })
    }

    handleInput = async e => {
        const
            { veiculos, empresas } = this.props.redux,
            { name } = e.target
        let
            { value } = e.target

        this.setState({ [name]: value })

        switch (name) {
            case 'razaoSocial':

                let selectedEmpresa = empresas.find(e => e.razaoSocial === value)

                if (selectedEmpresa) {
                    const { razaoSocial, codigoEmpresa } = selectedEmpresa
                    await this.setState({ selectedEmpresa, razaoSocial, codigoEmpresa })
                    if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                    const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)

                    this.setState({ frota })

                } else this.setState({ selectedEmpresa: undefined, frota: [], placa: undefined })
                break

            case 'placa':
                if (typeof value === 'string') {
                    value = value.toLocaleUpperCase()
                    await this.setState({ [name]: value })
                }
                break
            case ('utilizacao'):
                this.setState({ distanciaMinima: undefined, distanciaMaxima: undefined })
                break
            case ('valorChassi'):
                this.setState({ [name]: formatMoney(value) })
                break
            case ('valorCarroceria'):
                this.setState({ [name]: formatMoney(value) })
                break
            default: void 0
        }
    }

    checkValid = async (name, value, collection, stateId, dbName, dbId, alertLabel) => {

        const item = collection.find(el => el[dbName].toLowerCase() === value.toLowerCase())
        if (!item && value && value !== '') {
            await this.setState({ [name]: '', [stateId]: '' })
            this.setState({
                alertType: 'invalidModel', openAlertDialog: true,
                customTitle: 'Modelo inválido.',
                customMessage: `O modelo de ${alertLabel} não está cadastrado no sistema.`
            })
            document.getElementsByName(name)[0].focus()
            return
        }
        if (value === '')
            this.setState({ [name]: '', [stateId]: '' })
        if (item) {
            const
                nombre = item[dbName],
                id = item[dbId]
            if (value !== '')
                await this.setState({ [name]: nombre, [stateId]: id })
        }
    }

    handleBlur = async e => {
        const
            { empresas, modelosChassi, carrocerias, parametros } = this.props.redux,
            { distanciaPoltronas, idadeBaixa } = parametros[0],
            { idadeMaxCad, difIdade, idadeBaixaAut } = idadeBaixa,
            { anoCarroceria, anoChassi, utilizacao, distanciaMinima, distanciaMaxima, situacao } = this.state,
            { name } = e.target,
            carr = Number(anoCarroceria),
            chas = Number(anoChassi),
            currentYear = new Date().getFullYear()

        let
            { value } = e.target,
            customTitle,
            customMessage,
            maxYear = currentYear - idadeMaxCad

        //Se o veículo for reativado, o ano de fabricação de referência para cadastro é o da baixa automática, não a idadeMaxCad
        if (situacao && situacao.match('Reativação'))
            maxYear = currentYear - idadeBaixaAut

        switch (name) {
            case 'modeloChassi':
                await this.checkValid(name, value, modelosChassi, 'modeloChassiId', 'modeloChassi', 'id', 'chassi')
                getCMT(this)
                this.setState({ pesoDianteiro: undefined, pesoTraseiro: undefined })
                break
            case 'modeloCarroceria':
                this.checkValid(name, value, carrocerias, 'modeloCarroceriaId', 'modelo', 'id', 'carroceria')
                break
            case 'delegatarioCompartilhado':
                this.checkValid(name, value, empresas, 'compartilhadoId', 'razaoSocial', 'codigoEmpresa')
                break
            case 'anoChassi':
                customTitle = 'Ano de chassi inválido.'
                if (chas && chas < maxYear - 1)
                    customMessage = `O ano de fabricação do chassi informado é anterior à idade máxima permitida para cadastro.`
                if ((carr && chas && (carr < chas || carr > chas + difIdade)))
                    customMessage = 'O ano de chassi é incompatível com o ano da carroceria informado.'

                if (customMessage) {
                    this.setState({ anoChassi: '', openAlertDialog: true, customTitle, customMessage })
                }
                break
            case 'anoCarroceria':
                customTitle = 'Ano de carroceria inválido.'
                if (carr && carr < maxYear)
                    customMessage = `O ano de fabricação do carroceria informado é anterior à idade máxima permitida.`
                if ((carr && chas && (carr < chas || carr > chas + difIdade)))
                    customMessage = 'O ano de fabricação carroceria é incompatível com o ano do chassi informado.'

                if (customMessage) {
                    this.setState({ anoCarroceria: '', openAlertDialog: true, customTitle, customMessage })
                }
                break
            case 'distanciaMinima':
                let errorMsg
                if (utilizacao)
                    errorMsg = validateDist(utilizacao, distanciaMinima, distanciaPoltronas)
                if (distanciaMinima && +distanciaMinima > +distanciaMaxima)
                    errorMsg = 'A Distância mínima não pode ser superior à distância máxima.'
                if (errorMsg)
                    this.setState({
                        openAlertDialog: true,
                        customTitle: 'Distância mínima inválida.',
                        customMessage: errorMsg,
                        distanciaMinima: ''
                    })
                break
            case 'distanciaMaxima': {
                let errorMsg
                if (utilizacao)
                    errorMsg = validateDist(utilizacao, distanciaMaxima, distanciaPoltronas)
                if (distanciaMaxima && +distanciaMaxima < +distanciaMinima)
                    errorMsg = 'A Distância máxima não pode ser inferior à distância mínima.'
                if (errorMsg)
                    this.setState({
                        openAlertDialog: true,
                        customTitle: 'Distância máxima inválida.',
                        customMessage: errorMsg,
                        distanciaMaxima: ''
                    })
                break
            }
            case ('pesoDianteiro'):
                checkWeight(this, name)
                break
            case 'pesoTraseiro':
                checkWeight(this, name)
                break
            case 'poltronas':
                checkWeight(this, name)
                break
            default: void 0
        }

        if (name === 'placa' && typeof this.state.frota !== 'string') {

            if (value.length === 7) {
                const x = value.replace(/(\w{3})/, '$1-')
                await this.setState({ placa: x, reactivated: false })
                value = x
            }
            if (value.length === 8) {
                const x = value.replace(' ', '-')
                await this.setState({ placa: x, reactivated: false })
                value = x
            }
            this.checkPlateConflict(value)
        }
    }

    checkPlateConflict = async value => {
        const
            checkExistence = await axios.get(`/api/alreadyExists?table=veiculos&column=placa&value=${value}`),
            placaMatch = checkExistence?.data,
            vehicle = placaMatch?.vehicleFound

        let customTitle, customMessage

        if (placaMatch && !this.state.demand) {
            const { status } = placaMatch
            if (status === 'existing') {
                if (vehicle?.situacao.match(/Cadastro|Reativação/g)) {
                    customTitle = 'Solicitação aberta.'
                    customMessage = 'Já existe uma solicitação de cadastro ou reativação para a placa informada. Para acompanhar, acesse \'Solicitações\' e filtre pela placa do veículo. '
                }
                else {
                    customTitle = 'Veículo já cadastrado.'
                    customMessage = 'A placa informada corresponde a um veículo já cadastrado. Para alterar o cadastro, vá para Veículos -> \'Alteração de dados\'.'
                }
                this.setState({ customTitle, customMessage, openAlertDialog: true, placa: null, reactivated: false })
                value = ''
                return
            }
            else if (vehicle['Situação'] === 'Reativado') {
                let reactivatedVehicle = {}
                for (let k in vehicle) {
                    dischargedForm.forEach(({ field, label }) => {
                        if (k === label && ['renavam', 'nChassi', 'anoChassi', 'anoCarroceria'].includes(field))
                            reactivatedVehicle[field] = vehicle[k]
                    })
                }
                reactivatedVehicle.situacao = "Reativação solicitada"
                await this.setState({ ...reactivatedVehicle, reactivated: true })
                return
            }

            else if (status === 'discharged') {
                customTitle = 'Veículo baixado.'
                customMessage = 'A placa informada corresponde a um veículo baixado. Para reativar seu cadastro, vá para Veículos -> Baixa -> \'Gerenciar Veículos Baixados\'.'
                this.setState({ customTitle, customMessage, openAlertDialog: true, placa: null, reactivated: false })
                value = ''
            }
        }
    }

    handleEquipa = async type => {

        const collection = this.props.redux[type]
        let
            vEquip = [],
            currentEquipa = []

        await this.setState({ type })

        //Só precisa pegar a lista e marcar check na hora de abrir o dialog.
        if (this.state.addEquipa === false) {
            if (this.state[type])
                currentEquipa = this.state[type]

            collection.forEach(({ item }) => {
                currentEquipa.forEach(eq => {
                    if (eq.toLowerCase() === item.toLowerCase())
                        vEquip.push(item)
                })
            })
            vEquip.forEach(ve => this.setState({ [ve]: true }))
        }
        this.setState({ addEquipa: !this.state.addEquipa })
    }

    handleCheck = async item => {
        const
            { type } = this.state,
            collection = this.props.redux[type]

        if (!collection) return

        let arrayOfEquips = [], ids = [], stateKey

        if (type === 'equipamentos') stateKey = 'equipamentosId'
        if (type === 'acessibilidade') stateKey = 'acessibilidadeId'

        await this.setState({ ...this.state, [item]: !this.state[item] })

        collection.forEach(({ id, item }) => {
            if (this.state[item] === true) {
                arrayOfEquips.push(item)
                ids.push(id)
            }
        })

        if (arrayOfEquips[0]) this.setState({ [type]: arrayOfEquips, [stateKey]: ids })
        else if (type === 'equipamentos') this.setState({ equipamentos: [], [stateKey]: [] })
        else if (type === 'acessibilidade') this.setState({ acessibilidade: [], [stateKey]: [] })
    }

    handleCadastro = async approved => {
        const
            { equipamentosId, acessibilidadeId, pbt, compartilhadoId, modeloChassiId, originalVehicle, getUpdatedValues,
                modeloCarroceriaId, selectedEmpresa, showPendencias, obs, form, demand, demandFiles, reactivated } = this.state,
            { codigoEmpresa } = selectedEmpresa,
            existingVeiculoId = demand?.veiculoId,
            oldHistoryLength = demand?.history?.length || 0

        let
            veiculoId,
            situacao = 'Cadastro solicitado'

        //**********Prepare the request Object************* */
        let review = {}
        cadVehicleForm.forEach(form => {
            form.forEach(obj => {
                for (let k in this.state) {
                    if (k === obj.field && this.state[k] !== '')
                        Object.assign(review, { [k]: this.state[k] })
                }
            })
        })

        //Retira campos desnecessários para o cadastro (joins de outras tabelas)
        let { delegatarioCompartilhado, modeloChassi, modeloCarroceria, apolice, numeroDae, ...vReview } = review

        //Adiciona campos que não estão no formulário ao objeto do request
        Object.assign(vReview, {
            codigoEmpresa, situacao, pbt, modeloChassiId, modeloCarroceriaId, obs,
            equipamentosId, acessibilidadeId, apolice: 'Seguro não cadastrado'
        })

        //Elimina chaves com empty string
        for (let k in vReview) {
            if (vReview[k] === '')
                delete vReview[k]
        }
        console.log(vReview)
        vReview.compartilhadoId = compartilhadoId && compartilhadoId
        //Save only real changes to the request Object (method from setDemand())
        if (demand && originalVehicle)
            vReview = getUpdatedValues(originalVehicle, vReview)

        const vehicle = humps.decamelizeKeys(vReview)
        //console.log(vReview, '437')

        //***************If it doesn't exist, post the new vehicle Object **************** */
        if (!existingVeiculoId)
            await axios.post('/api/cadastroVeiculo', vehicle)
                .then(res => {
                    veiculoId = res.data
                })
                .catch(err => console.log(err))

        //***************Else, if it exists, get existing Id and update status******************* */
        else {
            veiculoId = existingVeiculoId

            if (demand && approved && !showPendencias)
                situacao = 'Seguro não cadastrado'
            const
                table = 'veiculos',
                tablePK = 'veiculo_id',
                requestObject = {
                    ...vehicle,
                    situacao
                }
            await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: veiculoId, codigoEmpresa }) //CodigoEmpresa para F5 sockets
        }

        //******************Inserir número da DAE na info da solicitação************** */
        let { info } = this.state
        if (typeof info === 'string' && numeroDae)
            info += `\n\n Nº Documento Arrecadação Estadual: ${numeroDae}`

        //*****************Generate log ************** */
        const log = {
            empresaId: selectedEmpresa?.codigoEmpresa,
            veiculoId,
            history: {
                info,
                numeroDae,
                files: form,
            },
            metadata: { veiculoId },
            demandFiles,
            historyLength: oldHistoryLength,
            approved
        }

        if (demand)
            log.id = demand?.id
        if (reactivated)
            log.subject = 'Reativação de veículo'

        logGenerator(log)
            .then(r => console.log(r?.data))
            .catch(err => console.log(err))

        //*************Confirm send and clear State******************* */
        if (!approved) {
            let toastMsg = 'Solicitação de cadastro enviada.'
            if (demand && demand.status.match('Aguardando'))
                toastMsg = 'Pendências para o cadastro registradas.'
            this.toast(toastMsg)
        }
        else
            this.toast()

        if (!demand)
            this.resetState()
        else
            setTimeout(() => { this.props.history.push('/solicitacoes') }, 1500)
    }

    handleFiles = async (files, name) => {

        if (files && files[0]) {
            await this.setState({ [name]: files[0] })

            const newState = handleFiles(files, this.state, cadVehicleFiles)
            this.setState({ ...newState, fileToRemove: null })
        }
    }

    removeFile = async (name) => {
        const
            { form } = this.state,
            newState = removeFile(name, form)

        this.setState({ ...this.state, ...newState })
    }

    resetState = () => {
        const
            { empresas, veiculos, equipamentos, acessibilidade } = this.props.redux,
            equip = equipamentos.concat(acessibilidade),
            resetEquips = { acessibilidade: [], acessibilidadeId: [], equipamentos: [], equipamentosId: [] }
        let
            resetFiles = {},
            empresaDetails = {}

        cadVehicleForm.forEach(form => form.forEach(el => this.setState({ [el.field]: '' })))
        cadVehicleFiles.forEach(({ name }) => { Object.assign(resetFiles, { [name]: undefined }) })

        //Limpa os check de todos os equipamento
        equip.forEach(e => this.setState({ [e.item]: false }))

        //Se o usuário só tiver uma empresa, manter os dados da empresa após resetState
        if (empresas && empresas.length === 1)
            empresaDetails = { selectedEmpresa: empresas[0], razaoSocial: empresas[0]?.razaoSocial, frota: veiculos }

        this.setState({ ...resetFiles, ...resetEquips, ...equip, form: undefined, info: undefined, activeStep: 0, ...empresaDetails, })
    }

    closeEquipa = () => this.setState({ addEquipa: false })
    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    removePartilha = () => this.setState({ compartilhado: undefined })
    toast = toastMsg => this.setState({ confirmToast: !this.state.confirmToast, toastMsg: toastMsg ? toastMsg : this.state.toastMsg })

    render() {
        const
            { confirmToast, toastMsg, activeStep, openAlertDialog, alertType, steps, selectedEmpresa, dropDisplay, form,
                demand, placa, demandFiles, showPendencias, info, resetShared, customMessage, customTitle, obs, existingPendencias } = this.state,

            { redux } = this.props

        return <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Cadastro de veículo' demand={demand} selectedEmpresa={selectedEmpresa} />

            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                setActiveStep={this.setActiveStep}
            />
            <CadVeiculoTemplate
                data={this.state}
                redux={redux}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                handleEquipa={this.handleEquipa}
                handleCheck={this.handleCheck}
                closeEquipa={this.closeEquipa}
                match={this.props.match}
                resetShared={resetShared}
                removePartilha={this.removePartilha}
            />
            {activeStep === 2 && <VehicleDocs
                parentComponent='cadastro'
                dropDisplay={dropDisplay}
                formData={form}
                handleFiles={this.handleFiles}
                demandFiles={demandFiles}
                fileToRemove={this.state.fileToRemove}
                removeFile={this.removeFile}
            />}

            {activeStep === 3 && <Review
                parentComponent='cadastro'
                data={this.state}
                files={this.state.form}
                filesForm={cadVehicleFiles}
                form={cadVehicleForm}
            />}

            {selectedEmpresa && <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                setActiveStep={this.setActiveStep}
                demand={demand}
                setShowPendencias={this.setShowPendencias}
                showPendencias={showPendencias}
                info={info}
                handleSubmit={this.handleCadastro}
                handleInput={this.handleInput}
                addObs={demand && !existingPendencias && !showPendencias}  //Se tiver na aprovação, o campo info vira obs para registrar obs do veículo.
                obs={obs}
                disabled={(typeof placa !== 'string' || placa === '')}
            />}
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            {openAlertDialog &&
                <AlertDialog open={openAlertDialog} close={this.toggleDialog}
                    alertType={alertType} customMessage={customMessage} customTitle={customTitle} />}
        </Fragment>
    }
}
const collections = ['veiculos', 'empresas', 'compartilhados', 'modelosChassi', 'carrocerias', 'equipamentos', 'acessibilidade', 'getFiles/vehicleDocs', 'parametros']

export default StoreHOC(collections, VeiculosContainer)