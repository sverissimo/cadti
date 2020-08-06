import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import valueParser from '../Utils/valueParser'
import { checkInputErrors } from '../Utils/checkInputErrors'
import ReactToast from '../Reusable Components/ReactToast'
import Crumbs from '../Reusable Components/Crumbs'

import AltProcuradoresTemplate from './ProcuradoresTemplate'
import download from '../Utils/downloadFile'
import { procuradorForm } from '../Forms/procuradorForm'

import AlertDialog from '../Reusable Components/AlertDialog'
import { logGenerator } from '../Utils/logGenerator'
import { setEmpresaDemand } from '../Utils/setEmpresaDemand'

class AltProcuradores extends Component {

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
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        files: [],
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
        this.setState({ selectedEmpresa: this.props.redux.empresas[0], razaoSocial: this.props.redux.empresas[0].razaoSocial })

        const
            { redux } = this.props,
            demand = this.props?.location?.state?.demand,
            procuracoes = redux.procuracoes.filter(pr => pr.razaoSocial === this.props.redux.empresas[0].razaoSocial)

        //fetchFiles = await axios.get('/api/getFiles/empresaDocs?fieldName=procuracao'),
        //files = fetchFiles?.data
        //*************Set demand if any
        if (demand) {
            const
                originalProcuradores = JSON.parse(JSON.stringify(redux.procuradores)),
                demandState = setEmpresaDemand(demand, redux, originalProcuradores),
                { latestDoc, ...updatedState } = demandState,
                { history } = demand,
                { files, vencimento, expires } = history[0],
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
            console.log(updatedState, '**************fk*************', procsToAdd)
            this.setState({ vencimento, expires, procsToAdd })
            this.setState({ ...updatedState, demandFiles: latestDoc })
        }

        // ********* insert procuradores ass array of Object for each procuracao        
        let
            procArray = [],
            procuracoesArray = []

        if (procuracoes[0] && !demand) {
            procuracoes.forEach(pr => {
                pr.procuradores.forEach(id => {
                    const pro = this.props.redux.procuradores.find(p => p.procuradorId === id)
                    if (pro) procArray.push(pro)
                })
                procuracoesArray.push(procArray)
                procArray = []
            })

            this.setState({ procuracoesArray, selectedDocs: procuracoes })
        }

        document.querySelector('.MuiFormControlLabel-root').style = 'padding:15px 15px 0 0'
        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {
        const
            { name } = e.target,
            procuradores = [...this.props.redux.procuradores]
        let
            { value } = e.target,
            procuracoes = [...this.props.redux.procuracoes],
            procArray = [],
            procuracoesArray = []

        //***********************Parse values ********************** */

        const parsedValue = valueParser(name, value)
        this.setState({ [name]: parsedValue })

        //**************************SetState *********************** */
        if (name === 'razaoSocial' && Array.isArray(procuradores)) {

            procuracoes = procuracoes.filter(pr => pr.razaoSocial === value)

            if (procuracoes[0]) procuracoes.forEach(pr => {
                pr.procuradores.forEach(id => {
                    const pro = procuradores.find(p => p.procuradorId === id)
                    if (pro) procArray.push(pro)

                })
                procuracoesArray.push(procArray)
                procArray = []
            })

            this.setState({ procuracoesArray, selectedDocs: procuracoes })

            const selectedEmpresa = this.props.redux.empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
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
            { selectedEmpresa, procFiles, vencimento, demand, expires } = this.state,
            procuradores = JSON.parse(JSON.stringify(redux.procuradores)),
            nProc = [...this.state.procsToAdd]
        let
            addedProcs = [],
            sObject = {}

        //***********************Check for errors *********************** */

        let { errors } = checkInputErrors('returnObj', 'Dont check the date, please!') || []

        if (errors && errors[0]) {
            if (!expires)
                await this.setState({ ...this.state, ...checkInputErrors('setState', 'dontCheckDate') })
            else
                await this.setState({ ...this.state, ...checkInputErrors('setState') })
            return
        }

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
            oldMembers = [],
            procIdArray = [],
            contratoFile = new FormData()

        addedProcs.forEach(addedProc => {
            gotId = procuradores.find(p => p.cpfProcurador === addedProc.cpfProcurador)
            if (gotId?.procuradorId) {

                Object.keys(addedProc).forEach(k => {
                    if (addedProc[k] === gotId[k])
                        delete addedProc[k]
                })
                console.log(oldMembers)
                addedProc.procuradorId = gotId.procuradorId
                oldMembers.push(addedProc)
            }
            else
                newMembers.push(addedProc)
        })
        

        if (approved === undefined) {
            const
                empresaId = selectedEmpresa.delegatarioId,
                log = {
                    status: 'Aguardando aprovação',
                    empresaId,
                    history: {
                        files: procFiles,
                        newMembers,
                        oldMembers,
                        vencimento,
                        expires
                    },
                    metadata: {
                        fieldName: 'procFile',
                        empresaId
                    },
                    oneAtemptDemand: true,
                }
            Object.entries(log).forEach(([k, v]) => { if (!v) delete log[k] })
            log.approved = approved
            logGenerator(log)
                .then(r => console.log(r))
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
        let
            selectedDocs = [...this.state.selectedDocs],
            files = [...this.state.files]

        //******************Post newMembers  *****************/
        if (newMembers.length > 0) {
            newMembers = humps.decamelizeKeys(newMembers)
            await axios.post('/api/cadProcuradores', { procuradores: newMembers, table: 'procurador', tablePK: 'procurador_id' })
                .then(procs => {
                    console.log(procs.data)
                    procs.data.forEach(p => procIdArray.push(p.procurador_id))
                })
        }

        console.log(procIdArray)
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

        //generate log
        logGenerator(log)
            .then(r => console.log(r))

        /* 
                if (procFiles) {
                    contratoFile.append('fieldName', 'procuracao')
                    contratoFile.append('empresaId', selectedEmpresa.delegatarioId)
                    contratoFile.append('procuracaoId', procuracaoId)
                    contratoFile.append('procuradores', procIdArray)
                    for (let pair of procFiles.entries()) {
                        contratoFile.append(pair[0], pair[1])
                    }
                    await axios.post('/api/empresaUpload', contratoFile)
                        .then(r => console.log(r.data))
        
                    await axios.get(`/api/getOneFile?collection=empresaDocs&id=${procuracaoId}`)
                        .then(r => { if (r.data[0]) files.push(r.data[0]) })
                } */

        selectedDocs.unshift(novaProcuracao)

        this.setState({
            selectedDocs,
            files,
            dropDisplay: 'Clique ou arraste para anexar a procuração referente a este(s) procurador(es).',
            procsToAdd: [1],
            vencimento: undefined,
            procFiles: undefined,
            telProcurador0: undefined
        })
        this.toast()
    }

    removeProc = async proc => {

        const { files } = this.state,
            id = proc.procuracaoId,
            selectedFile = files.find(f => Number(f.metadata.procuracaoId) === id)


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

    handleFiles = (file) => {
        let procFiles = new FormData()
        procFiles.append('procFile', file[0])
        this.setState({ procFiles, dropDisplay: file[0].name })
    }

    getFile = id => {
        const { files } = this.state

        const selectedFile = files.find(f => Number(f.metadata.procuracaoId) === id)

        if (selectedFile) {
            const { _id, filename } = selectedFile
            download(_id, filename, 'empresaDocs')
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
    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { openAlertDialog, alertType, demand } = this.state

        return (
            <React.Fragment>
                <Crumbs links={['Empresas', '/empresas']} text='Alteração de procuradores' demand={demand} />
                <AltProcuradoresTemplate
                    data={this.state}
                    redux={this.props.redux}
                    handleInput={this.handleInput}
                    removeProc={this.removeProc}
                    handleFiles={this.handleFiles}
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

const collections = ['empresas', 'procuradores', 'procuracoes']

export default (StoreHOC(collections, AltProcuradores))