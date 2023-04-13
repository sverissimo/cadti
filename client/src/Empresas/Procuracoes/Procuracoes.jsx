import React, { useState, useEffect } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../../Store/StoreHOC'
import { download, logGenerator, globalRemoveFile, sizeExceedsLimit, toInputDate } from '../../Utils'
import { AlertDialog, Crumbs, ReactToast } from '../../Reusable Components'
import { ProcuracoesTemplate } from './ProcuracoesTemplate'
import { useSelectEmpresa } from '../hooks/useSelectEmpresa'
import { useManageProcuradores } from './hooks/useManageProcuradores'
import { checkInputErrors } from './utils/checkInputErrors'

const initialState = {
    confirmToast: false,
    dropDisplay: 'Clique ou arraste para anexar a procuração referente a este(s) procurador(es).',
    expires: false,
    filteredProcuracoes: [],
    openDialog: false,
    showPendencias: false,
    toastMsg: 'Procuração cadastrada!',
}

const ProcuracoesContainer = (props) => {
    const [state, setState] = useState(initialState)

    const { empresas, procuracoes, empresaDocs, inputValidation, procuradores: allProcuradores } = props.redux
    const demand = props?.location?.state?.demand
    const { selectedEmpresa, selectEmpresa } = useSelectEmpresa(empresas, demand)
    const { procuradores, handleProcuradorChange, addProcurador, checkCpf, setProcuradoresFromDemand, removeProcurador, resetProcuradoresState } = useManageProcuradores()

    useEffect(() => {
        if (demand) {
            return
        }

        if (selectedEmpresa) {
            const { razaoSocial } = selectedEmpresa
            const filteredProcuracoes = procuracoes.filter(p => p.codigoEmpresa === selectedEmpresa.codigoEmpresa)
            setState(state => ({ ...state, razaoSocial, filteredProcuracoes }))
        } else {
            setState(state => ({ ...state, filteredProcuracoes: [] }))
        }

    }, [selectedEmpresa, procuracoes, demand])

    useEffect(() => {
        if (demand?.history.length) {
            const selectedEmpresa = empresas.find(e => e.codigoEmpresa === demand.empresaId)
            const { vencimento: vencimentoISODate, expires, files } = demand.history[0]
            const vencimento = toInputDate(vencimentoISODate)
            const demandFiles = files && empresaDocs.filter(f => f.id === files[0])
            selectEmpresa(selectedEmpresa.razaoSocial)
            setProcuradoresFromDemand(demand)
            setState(state => ({ ...state, vencimento, expires, demandFiles }))
        }

        return () => setState(initialState)

    }, [demand, empresas])

    const handleInput = async (e, index) => {
        const { name, value } = e.target
        const procuradorKeys = Object.keys(procuradores[0])

        if (name === 'razaoSocial') {
            selectEmpresa(value)
            setState(s => ({ ...s, [name]: value }))
            return
        }
        if (procuradorKeys.includes(name)) {
            handleProcuradorChange(e, index)
            return
        }
        setState(s => ({ ...s, [name]: value }))
    }

    const handleBlur = async (e, index) => {
        if (e.target.name === 'cpfProcurador') {
            checkCpf(e, index)
        }
    }

    const handleSubmit = async (approved) => {
        const errors = checkInputErrors(state.expires, procuradores)
        if (errors && inputValidation) {
            setState({ ...state, ...errors })
            return
        }

        const { procuracao, vencimento, expires, info } = state
        const empresaId = selectedEmpresa.codigoEmpresa
        const oldMembers = procuradores.filter(p => !!p.procuradorId)
        const newMembers = procuradores.filter(
            p => !p.procuradorId
                && !Object.keys(p).every(key => !p[key])
        )

        if (approved === undefined) {
            const log = {
                empresaId,
                status: 'Aguardando aprovação',
                history: {
                    files: procuracao,
                    newMembers,
                    oldMembers,
                    vencimento,
                    expires,
                },
                metadata: {
                    fieldName: 'procuracao',
                    empresaId,
                },
            }
            if (!procuracao) delete log.metadata
            Object.entries(log).forEach(([k, v]) => { if (!v) delete log[k] })
            log.approved = approved
            log.historyLength = 0

            await logGenerator(log).catch(e => console.log(e))

            setState({ ...state, toastMsg: 'Solicitação de cadastro enviada', confirmToast: true })
            setTimeout(() => { resetState() }, 1500);
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

            await logGenerator(log).catch(e => console.log(e))
            setState({ ...state, toastMsg: 'Solicitação indeferida!', confirmToast: true, status: 'warning' })
            setTimeout(() => {
                props.history.push('/solicitacoes')
            }, 1500);
        }

        if (approved === true) {
            approveProc(newMembers, oldMembers)
            toast()
            setTimeout(() => { props.history.push('/solicitacoes') }, 1500)
        }
    }

    const approveProc = async (newMembers, oldMembers) => {
        const { demandFiles, vencimento } = state
        const { codigoEmpresa } = selectedEmpresa
        const procuradoresIDs = oldMembers.map(m => m.procuradorId)

        if (newMembers.length > 0) {
            newMembers.forEach(m => m.empresas = [codigoEmpresa])
            const procuradores = humps.decamelizeKeys(newMembers)
            const { data: ids } = await axios.post('/api/procuradores', {
                codigoEmpresa,
                procuradores,
            })
            procuradoresIDs.push(...ids)
        }

        const novaProcuracao = {
            codigo_empresa: codigoEmpresa,
            vencimento,
            status: 'vigente',
            procuradores: procuradoresIDs
        }

        const { data: procuracaoId } = await axios.post('/api/procuracoes', novaProcuracao)
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
                procuradores: procuradoresIDs,
            }
        }

        await logGenerator(log).catch(e => console.log(e))
    }

    const deleteProcuracao = async proc => {
        const id = proc.procuracaoId
        const selectedFile = empresaDocs.find(f => Number(f.metadata.procuracaoId) === id)

        await axios.delete(`/api/procuracoes?id=${id}`)

        if (selectedFile && selectedFile.hasOwnProperty('id')) {
            axios.delete(`/api/deleteFile?collection=empresaDocs&id=${selectedFile.id}`)
                .then(({ data }) => console.log(data))
        }
    }

    const handleFiles = files => {
        if (sizeExceedsLimit(files))
            return

        let procuracao = new FormData()
        procuracao.append('procuracao', files[0])
        setState({ ...state, procuracao, fileToRemove: null })
    }

    const removeFile = async (name) => {
        const { procuracao } = state
        const newState = globalRemoveFile(name, procuracao)
        setState({ ...state, ...newState })
    }

    const getFile = id => {
        const selectedFile = empresaDocs.find(f => Number(f.metadata.procuracaoId) === id)
        if (!selectedFile) {
            setState({ ...state, alertType: 'filesNotFound', openAlertDialog: true })
            return
        }

        const { id, filename } = selectedFile
        download(id, filename, 'empresaDocs')
    }

    const checkExpires = () => {
        let vencimento
        if (state.expires === true) {
            vencimento = ''
        }
        setState({ ...state, vencimento, expires: !state.expires })
    }

    const resetState = () => {
        resetProcuradoresState()
        removeFile('procuracao')
        setState({
            ...initialState,
            filteredProcuracoes: state.filteredProcuracoes,
            vencimento: undefined,
            procuracao: undefined,
        })
    }

    const setShowPendencias = () => setState({ ...state, showPendencias: !state.showPendencias })
    const closeAlert = () => setState({ ...state, openAlertDialog: !state.openAlertDialog })
    const toast = () => setState({ ...state, confirmToast: !state.confirmToast })
    const { openAlertDialog, alertType } = state
    return (
        <>
            <Crumbs links={['Empresas', '/empresas']} text='Cadastro de procurações' demand={demand} />
            <ProcuracoesTemplate
                data={state}
                empresas={empresas}
                allProcuradores={allProcuradores}
                selectedEmpresa={selectedEmpresa}
                procuradoresEdit={procuradores}
                demand={demand}
                handleInput={handleInput}
                handleBlur={handleBlur}
                deleteProcuracao={deleteProcuracao}
                handleFiles={handleFiles}
                removeFile={removeFile}
                addProc={handleSubmit}
                addProcurador={addProcurador}
                removeProcurador={removeProcurador}
                getFile={getFile}
                checkExpires={checkExpires}
                setShowPendencias={setShowPendencias}
            />
            <ReactToast open={state.confirmToast} close={toast} msg={state.toastMsg} status={state.status} />
            {
                openAlertDialog &&
                <AlertDialog open={openAlertDialog} close={closeAlert} alertType={alertType} customMessage={state.customMsg} />
            }
        </>
    )
}

const collections = ['empresas', 'procuradores', 'procuracoes', 'getFiles/empresaDocs']

export const Procuracoes = (StoreHOC(collections, ProcuracoesContainer))
