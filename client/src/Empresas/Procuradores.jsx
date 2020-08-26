import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import valueParser from '../Utils/valueParser'
import { checkInputErrors } from '../Utils/checkInputErrors'
import ReactToast from '../Reusable Components/ReactToast'
import Crumbs from '../Reusable Components/Crumbs'

import ProcuradoresTemplate from './ProcuradoresTemplate'
import download from '../Utils/downloadFile'
import { procuradorForm } from '../Forms/procuradorForm'

import AlertDialog from '../Reusable Components/AlertDialog'
import { logGenerator } from '../Utils/logGenerator'
import { setEmpresaDemand } from '../Utils/setEmpresaDemand'
import { removeFile, sizeExceedsLimit } from '../Utils/handleFiles'

class Procuradores extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.openDialog) this.toggleDialog()
            }
        }
    }

    state = {
        empresas: [],
        razaoSocial: '',
        toastMsg: 'Procuração cadastrada!',
        confirmToast: false,
        fileNames: [],
        openDialog: false,
        expires: false,
        filteredProc: [],
        dropDisplay: 'Clique ou arraste para anexar a procuração referente a este(s) procurador(es).',
        procuradores: [],
        procsToAdd: [1],
        procuracoesArray: [],
        selectedDocs: [],
        showPendencias: false
    }

    async componentDidMount() {
        const
            { redux } = this.props,
            demand = this.props?.location?.state?.demand

        //*************Set demand if any
        if (demand) {
            const
                originalProcuradores = JSON.parse(JSON.stringify(redux.procuradores)),
                demandState = setEmpresaDemand(demand, redux, originalProcuradores),
                { latestDoc, ...updatedState } = demandState,
                { history } = demand,
                { vencimento, expires } = history[0],
                newMembers = history[0].newMembers || [],
                oldMembers = history[0].oldMembers || []

            let allDemandProcs, procsToAdd = []

            if (oldMembers[0]) {
                oldMembers.forEach(m => {
                    originalProcuradores.forEach(op => {
                        Object.keys(op).forEach(key => {
                            if (m?.procuradorId === op?.procuradorId && !m[key]) {
                                m[key] = op[key]
                            }
                        })
                    })
                })
            }
            if (newMembers[0] || oldMembers[0]) {
                allDemandProcs = newMembers.concat(oldMembers)
                allDemandProcs.forEach((p, i) => {
                    procsToAdd.push(i)
                    procuradorForm.forEach(({ field }) => {
                        this.setState({ [field + i]: p[field] })
                    })
                })
            }
            this.setState({ vencimento, expires, procsToAdd })
            this.setState({ ...updatedState, demandFiles: [latestDoc] })
        }

        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {
        const
            { name } = e.target,
            { empresas } = this.props.redux,
            procuradores = [...this.props.redux.procuradores],
            procuracoes = JSON.parse(JSON.stringify(this.props.redux.procuracoes))

        let { value } = e.target

        //***********************Parse values ********************** */
        const parsedValue = valueParser(name, value)
        this.setState({ [name]: parsedValue })

        //**************************SetState *********************** */
        if (name === 'razaoSocial' && Array.isArray(procuradores)) {

            const selectedEmpresa = empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                const selectedDocs = procuracoes.filter(pr => pr.delegatarioId === selectedEmpresa.delegatarioId)
                await this.setState({ selectedEmpresa, selectedDocs, razaoSocial: selectedEmpresa.razaoSocial })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

            } else this.setState({ selectedEmpresa: undefined })
        }

        if (name.match('cpfProcurador')) {

            const proc = procuradores.find(p => p.cpfProcurador === value)
            if (proc) {
                const index = name.charAt(name.length - 1)
                let cpfExists
                Object.keys(this.state).forEach(stateKey => {
                    if (stateKey !== name && this.state[stateKey] === value) {
                        alert('Este CPF já foi informado.')
                        this.setState({ [name]: '' })
                        cpfExists = true
                    }
                })

                if (!cpfExists)
                    procuradorForm.forEach(({ field }) => {
                        const key = field + index
                        this.setState({ [key]: proc[field] })
                    })
            }
        }
    }

    addProc = async (approved) => {

        const
            { redux } = this.props,
            { selectedEmpresa, demand, procuracao, vencimento, expires, info } = this.state,
            empresaId = selectedEmpresa.delegatarioId,
            procuradores = JSON.parse(JSON.stringify(redux.procuradores)),
            nProc = [...this.state.procsToAdd]
        let
            addedProcs = [],
            sObject = {}

        //***********************Check for errors *********************** */
        /*       let { errors } = checkInputErrors('returnObj', 'Dont check the date, please!') || []
      
              if (errors && errors[0]) {
                  if (!expires)
                      await this.setState({ ...this.state, ...checkInputErrors('setState', 'dontCheckDate') })
                  else
                      await this.setState({ ...this.state, ...checkInputErrors('setState') })
                  return
              }
   */
        //***********Create array of Procs from state***********
        nProc.forEach((n, i) => {
            procuradorForm.forEach(obj => {
                Object.assign(sObject, { [obj.field]: this.state[obj.field + i] })
            })
            let j = 0
            Object.values(sObject).forEach(v => {
                if (v) j += 1
            })
            if (j > 0) addedProcs.push(sObject)
            j = 0
            sObject = {}

            procuradorForm.forEach(obj => {
                this.setState({ [obj.field + i]: '' })
            })
        })

        let
            gotId,
            newMembers = [],
            oldMembers = []

        addedProcs.forEach(addedProc => {
            gotId = procuradores.find(p => p.cpfProcurador === addedProc.cpfProcurador)
            if (gotId?.procuradorId) {

                Object.keys(addedProc).forEach(k => {
                    if (addedProc[k] === gotId[k])
                        delete addedProc[k]
                })
                addedProc.procuradorId = gotId.procuradorId
                oldMembers.push(addedProc)
            }
            else
                newMembers.push(addedProc)
        })

        if (approved === undefined) {

            const log = {
                status: 'Aguardando aprovação',
                empresaId,
                history: {
                    files: procuracao,
                    newMembers,
                    oldMembers,
                    vencimento,
                    expires
                },
                metadata: {
                    fieldName: 'procuracao',
                    empresaId
                },
            }
            Object.entries(log).forEach(([k, v]) => { if (!v) delete log[k] })
            log.approved = approved
            log.historyLength = 0

            logGenerator(log)
                .then(r => console.log(r))

            this.setState({ toastMsg: 'Solicitação de cadastro enviada', confirmToast: true })
            setTimeout(() => { this.resetState() }, 1500);
        }
        if (approved === false) {
            const log = {
                id: demand.id,
                empresaId,
                history: {
                    info
                },
                declined: true
            }
            logGenerator(log)
                .then(r => console.log(r))
            this.setState({ toastMsg: 'Solicitação indeferida!', confirmToast: true })
            setTimeout(() => {
                this.props.history.push('/solicitacoes')
            }, 1500);
        }
        if (approved === true) {
            newMembers = humps.decamelizeKeys(newMembers)
            oldMembers = humps.decamelizeKeys(oldMembers)
            this.approveProc(newMembers, oldMembers)
        }
    }

    approveProc = async (newMembers, oldMembers) => {

        const
            { selectedEmpresa, demandFiles, vencimento, demand } = this.state,
            procIdArray = oldMembers.map(m => m.procurador_id)

        //******************Post newMembers  *****************/
        if (newMembers.length > 0) {
            newMembers = humps.decamelizeKeys(newMembers)
            await axios.post('/api/cadProcuradores', { procuradores: newMembers, table: 'procurador', tablePK: 'procurador_id' })
                .then(procs => {
                    procs.data.forEach(p => procIdArray.push(p.procurador_id))
                })
        }

        //***************Update existing members ****************/
        const request = {
            table: 'procurador',
            tablePK: 'procurador_id',
            requestArray: oldMembers,
            keys: procuradorForm.map(p => humps.decamelize(p.field))
        }

        axios.put('/api/editProc', { ...request })
            .then(r => console.log(r))

        //***************Create new Procuracao****************/
        let novaProcuracao = {
            delegatario_id: selectedEmpresa.delegatarioId,
            vencimento,
            status: 'vigente',
            procuradores: procIdArray
        }

        Object.entries(novaProcuracao).forEach(([k, v]) => {
            if (!v || v === '') delete novaProcuracao[k]
        })

        let procuracaoId

        await axios.post('/api/cadProcuracao', novaProcuracao)
            .then(r => procuracaoId = r.data[0].procuracao_id)

        novaProcuracao.procuracaoId = procuracaoId
        const log = {
            id: demand.id,
            demandFiles,
            history: {},
            approved: true
        }

        if (demandFiles)
            log.metadata = {
                fieldName: 'procuracao',
                empresaId: selectedEmpresa.delegatarioId,
                procuracaoId: procuracaoId,
                procuradores: procIdArray,
            }
        //generate log
        logGenerator(log)
            .then(r => console.log(r))

        this.toast()
        if (demand)
            setTimeout(() => {
                this.props.history.push('/solicitacoes')
            }, 1500);
        this.resetState()
    }

    removeProc = async proc => {

        const
            id = proc.procuracaoId,
            selectedFile = this.props.redux.empresaDocs.find(f => Number(f.metadata.procuracaoId) === id)

        let procs = [...this.state.selectedDocs]

        await axios.delete(`/api/delete?table=procuracao&tablePK=procuracao_id&id=${id}`)
            .then(r => console.log(r.data))

        if (selectedFile && selectedFile.hasOwnProperty('_id'))
            axios.delete(`/api/deleteFile?collection=empresaDocs&id=${selectedFile._id}`)
                .then(({ data }) => console.log(data))

        const i = procs.indexOf(proc)
        procs.splice(i, 1)

        this.setState({ selectedDocs: procs })
    }

    handleFiles = files => {
        //limit file Size
        if (sizeExceedsLimit(files)) return

        let procuracao = new FormData()
        procuracao.append('procuracao', files[0])
        this.setState({ procuracao, fileToRemove: null })
    }

    removeFile = async (name) => {
        const
            { procuracao } = this.state,
            newState = removeFile(name, procuracao)

        this.setState({ ...this.state, ...newState })
    }

    getFile = id => {
        const
            { empresaDocs } = this.props.redux,
            selectedFile = empresaDocs.find(f => Number(f.metadata.procuracaoId) === id)

        if (selectedFile) {
            const { id, filename } = selectedFile
            download(id, filename, 'empresaDocs')
        } else {
            this.setState({ alertType: 'filesNotFound', openAlertDialog: true })
        }
    }

    plusOne = () => {
        let i = [...this.state.procsToAdd]
        i.push(1)
        this.setState({ procsToAdd: i })
    }

    minusOne = () => {
        let i = [...this.state.procsToAdd]
        i.pop()
        this.setState({ procsToAdd: i })
    }

    checkExpires = () => {
        if (this.state.expires === true) this.setState({ vencimento: '' })
        this.setState({ expires: !this.state.expires })
    }

    resetState = () => {
        const
            { procsToAdd } = this.state,
            keys = procuradorForm.map(({ field }) => field),
            resetedFields = {}

        procsToAdd.forEach((p, i) => {
            keys.forEach(key => {
                if (this.state.hasOwnProperty(key + i))
                    resetedFields[key + i] = undefined
            })
        })
        this.removeFile('procuracao')
        this.setState({
            ...resetedFields,
            dropDisplay: 'Clique ou arraste para anexar a procuração referente a este(s) procurador(es).',
            procsToAdd: [1],
            vencimento: undefined,
            procuracao: undefined,
            expires: false
        })
    }

    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { openAlertDialog, alertType, demand } = this.state

        return (
            <React.Fragment>
                <Crumbs links={['Empresas', '/empresas']} text='Cadastro de procurações' demand={demand} />
                <ProcuradoresTemplate
                    data={this.state}
                    redux={this.props.redux}
                    handleInput={this.handleInput}
                    removeProc={this.removeProc}
                    handleFiles={this.handleFiles}
                    removeFile={this.removeFile}
                    addProc={this.addProc}
                    handleSubmit={this.handleSubmit}
                    plusOne={this.plusOne}
                    minusOne={this.minusOne}
                    getFile={this.getFile}
                    checkExpires={this.checkExpires}
                    setShowPendencias={this.setShowPendencias}
                />
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customMessage={this.state.customMsg} />}
            </React.Fragment>
        )
    }
}

const collections = ['empresas', 'procuradores', 'procuracoes', 'getFiles/empresaDocs']

export default (StoreHOC(collections, Procuradores))