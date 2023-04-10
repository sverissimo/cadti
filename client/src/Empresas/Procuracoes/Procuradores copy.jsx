import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'
//import { checkInputErrors } from '../Utils/checkInputErrors'
import ProcuradoresTemplate from './ProcuradoresTemplate'
import download from '../Utils/downloadFile'
import { logGenerator } from '../Utils/logGenerator'
import { setEmpresaDemand } from '../Utils/setEmpresaDemand'
import { removeFile, sizeExceedsLimit } from '../Utils/handleFiles'
import valueParser from '../Utils/valueParser'
import { procuradorForm } from '../Forms/procuradorForm'
import AlertDialog from '../Reusable Components/AlertDialog'
import Crumbs from '../Reusable Components/Crumbs'
import ReactToast from '../Reusable Components/ReactToast'

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
            { empresas } = redux,
            demand = this.props?.location?.state?.demand,
            procuracoes = JSON.parse(JSON.stringify(this.props.redux.procuracoes))

        //Se o usuário representa apenas uma empresa, seleciona a empresa e carrega os dados
        if (empresas && empresas.length === 1) {
            const
                selectedEmpresa = empresas[0],
                selectedDocs = procuracoes.filter(pr => pr.codigoEmpresa === selectedEmpresa.codigoEmpresa)
            this.setState({ selectedEmpresa, razaoSocial: selectedEmpresa?.razaoSocial, selectedDocs })
        }

        if (demand) {
            const
                originalProcuradores = JSON.parse(JSON.stringify(redux.procuradores)),
                demandState = setEmpresaDemand(demand, redux, originalProcuradores),
                { latestDoc, ...updatedState } = demandState,
                { history } = demand,
                { vencimento, expires } = history[0],
                newMembers = history[0].newMembers || [],
                oldMembers = history[0].oldMembers || []
            console.log(demandState)
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

    componentDidUpdate(prevProps) {
        const
            { selectedEmpresa } = this.state,
            { procuracoes } = this.props.redux

        if (selectedEmpresa) {
            const
                { codigoEmpresa } = this.state?.selectedEmpresa,
                updatedProcs = JSON.parse(JSON.stringify(procuracoes))

            //Se alterar o redux por sockets,, altera state, pq procs são renderizadas a partir do state.
            if (JSON.stringify(prevProps.redux.procuracoes) !== JSON.stringify(updatedProcs)) {
                const updatedDocs = updatedProcs.filter(p => p.codigoEmpresa === codigoEmpresa)
                this.setState({ selectedDocs: updatedDocs })
            }
        }
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
                const selectedDocs = procuracoes.filter(pr => pr.codigoEmpresa === selectedEmpresa.codigoEmpresa)

                await this.setState({ selectedEmpresa, selectedDocs, razaoSocial: selectedEmpresa.razaoSocial })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined, selectedDocs: [] })

            } else this.setState({ selectedEmpresa: undefined, selectedDocs: [] })
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
            { selectedEmpresa, demand, procuracao, vencimento, expires, info } = this.state,
            empresaId = selectedEmpresa.codigoEmpresa,
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
              }   */
        //***********Create array of Procs from state***********
        nProc.forEach((n, i) => {
            procuradorForm.forEach(obj => {
                Object.assign(sObject, { [obj.field]: this.state[obj.field + i] })
            })
            let j = 0
            Object.values(sObject).forEach(v => {
                if (v) j += 1
            })
            if (j > 0)
                addedProcs.push(sObject)
            j = 0
            sObject = {}

            procuradorForm.forEach(obj => {
                this.setState({ [obj.field + i]: '' })
            })
        })

        let
            newMembers = [],
            oldMembers = []

        for (let addedProc of addedProcs) {
            const
                getData = await axios.get(`/api/procuradores?cpf_procurador=${addedProc.cpfProcurador}`),
                existingProc = humps.camelizeKeys(getData?.data[0])

            if (existingProc?.procuradorId) {

                //Acrescenta a empresa no array de empresas de cada procurador
                addedProc.empresas = existingProc.empresas
                //Se não tiver nenhuma empresa ou se o único códigoEmpresa na array for ===0 (quer dizer q tinha mas venceu ou foi excluído):
                //Nesse caso, a array de empresas no DB será um array de apenas 1 item, com o códigoEmpresa atual
                if ((addedProc.empresas[0] === 0 && addedProc.empresas.length === 1) || !addedProc.empresas)
                    addedProc.empresas = [empresaId]

                //Caso já tenha alguma outra, apenas acrescenta o novo codigoEmpresa, desde que não seja repetido
                if (addedProc.empresas && addedProc.empresas[0] && !addedProc.empresas.includes(empresaId))
                    addedProc.empresas.push(empresaId)

                Object.keys(addedProc).forEach(k => {
                    if (addedProc[k] === existingProc[k] && k !== 'empresas' && k !== 'cpfProcurador')
                        delete addedProc[k]
                })
                addedProc.procuradorId = existingProc.procuradorId
                oldMembers.push(addedProc)
            }
            else
                newMembers.push(addedProc)
        }

        //Se o request não for de aprovação, cria a demanda
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
            //setTimeout(() => { this.resetState() }, 1500);
        }
        //Demanda indeferida
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
        //Aprova alteração de procuradores/procuração
        if (approved === true) {
            newMembers = humps.decamelizeKeys(newMembers)
            oldMembers = humps.decamelizeKeys(oldMembers)
            this.approveProc(newMembers, oldMembers)
        }
    }

    approveProc = async (newMembers, oldMembers) => {
        const { selectedEmpresa, demandFiles, vencimento, demand } = this.state
        const { codigoEmpresa } = selectedEmpresa
        const procIdArray = oldMembers.map(m => m.procurador_id)

        if (newMembers.length > 0) {
            newMembers.forEach(m => m.empresas = [codigoEmpresa])
            newMembers = humps.decamelizeKeys(newMembers)

            await axios.post('/api/procuradores', {
                codigoEmpresa,
                procuradores: newMembers,
            })
                .then(ids => ids.data.forEach(id => procIdArray.push(id)))
        }

        const novaProcuracao = {
            codigo_empresa: codigoEmpresa,
            vencimento,
            status: 'vigente',
            procuradores: procIdArray
        }

        const procuracaoId = await axios.post('/api/procuracoes', novaProcuracao)
        const log = {
            id: demand.id,
            demandFiles,
            history: {},
            approved: true
        }

        if (demandFiles) {
            log.metadata = {
                fieldName: 'procuracao',
                empresaId: selectedEmpresa.codigoEmpresa,
                procuracaoId: procuracaoId,
                procuradores: procIdArray,
            }
        }

        logGenerator(log).then(r => console.log(r))

        this.toast()
        if (demand)
            setTimeout(() => {
                this.props.history.push('/solicitacoes')
            }, 1500);
        this.resetState()
    }

    removeProc = async proc => {
        const id = proc.procuracaoId
        const selectedFile = this.props.redux.empresaDocs.find(f => Number(f.metadata.procuracaoId) === id)

        await axios.delete(`/api/procuracoes?id=${id}`)

        if (selectedFile && selectedFile.hasOwnProperty('id')) {
            axios.delete(`/api/deleteFile?collection=empresaDocs&id=${selectedFile.id}`)
                .then(({ data }) => console.log(data))
        }
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
                {
                    openAlertDialog &&
                    <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} customMessage={this.state.customMsg} />
                }
            </React.Fragment>
        )
    }
}

const collections = ['empresas', 'procuradores', 'procuracoes', 'getFiles/empresaDocs']

export default (StoreHOC(collections, Procuradores))