import React, { useState, useEffect } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../../Store/StoreHOC'
import { checkInputErrors, download, logGenerator, setEmpresaDemand, globalRemoveFile, sizeExceedsLimit, valueParser } from '../../Utils'
import { AlertDialog, Crumbs, ReactToast } from '../../Reusable Components'
import { ProcuracoesTemplate } from './ProcuracoesTemplate'
import { useSelectEmpresa } from '../hooks/useSelectEmpresa'
import { procuradorForm } from './forms/procuradorForm'

const ProcuradoresContainer = (props) => {

    const [state, setState] = useState({
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
    })

    const escFunction = (event) => {
        if (event.keyCode === 27) {
            if (state.openDialog) toggleDialog()
            console.log('ESC pressed');
        }
    }

    const { redux } = props
    const { empresas, procuracoes } = redux
    const demand = props?.location?.state?.demand
    const { selectedEmpresa, selectEmpresa, setEmpresaFromDemand, prevSelectedEmpresa } = useSelectEmpresa(empresas, demand)

    useEffect(() => {
        if (demand) {
            return
        }
        if (selectedEmpresa) {
            const procuracoes = redux.procuracoes.filter(p => p.codigoEmpresa === selectedEmpresa.codigoEmpresa)
            setState({ ...state, selectedDocs: procuracoes || state.selectedDocs })
        }

    }, [selectedEmpresa, demand, redux.procuracoes])

    useEffect(() => {
        if (demand?.history.length) {
            const originalProcuradores = JSON.parse(JSON.stringify(redux.procuradores))
            const demandState = setEmpresaDemand(demand, redux, originalProcuradores)
            const { latestDoc, ...updatedState } = demandState
            const { history } = demand
            const { vencimento, expires } = history[0]
            const newMembers = history[0].newMembers || []
            const oldMembers = history[0].oldMembers || []

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
                        setState({ ...state, [field + i]: p[field] })
                    })
                })
            }
            setState({ ...state, ...updatedState, vencimento, expires, procsToAdd, demandFiles: [latestDoc] })
        }

        document.addEventListener('keydown', escFunction, false)

        return () => {
            document.removeEventListener('keydown', escFunction, false);
            setState({});
        };
    }, [redux, empresas, redux.procuradores, procuracoes, demand])

    const handleInput = async e => {
        const { name, value } = e.target
        const procuradores = [...redux.procuradores]

        if (name === 'razaoSocial') {
            selectEmpresa(value)
        }

        if (name.match('cpfProcurador')) {
            const proc = procuradores.find(p => p.cpfProcurador === value)
            if (proc) {
                const index = name.charAt(name.length - 1)
                let cpfExists
                Object.keys(state).forEach(stateKey => {
                    if (stateKey !== name && state[stateKey] === value) {
                        alert('Este CPF já foi informado.')
                        setState({ ...state, [name]: '' })
                        cpfExists = true
                    }
                })

                if (!cpfExists)
                    procuradorForm.forEach(({ field }) => {
                        const key = field + index
                        setState({ ...state, [key]: proc[field] })
                    })
            }
        }

        const parsedValue = valueParser(name, value)
        setState(s => ({ ...s, [name]: parsedValue }))
    }

    const addProc = async (approved) => {
        const
            { selectedEmpresa, demand, procuracao, vencimento, expires, info } = state,
            empresaId = selectedEmpresa.codigoEmpresa,
            nProc = [...state.procsToAdd]
        let
            addedProcs = [],
            sObject = {}

        //***********************Check for errors *********************** */
        /*       let { errors } = checkInputErrors('returnObj', 'Dont check the date, please!') || []
              if (errors && errors[0]) {
                  if (!expires)
                      await setState({ ...state, ...checkInputErrors('setState', 'dontCheckDate') })
                  else
                      await setState({ ...state, ...checkInputErrors('setState') })
                  return
              }   */
        //***********Create array of Procs from state***********
        nProc.forEach((n, i) => {
            procuradorForm.forEach(obj => {
                Object.assign(sObject, { [obj.field]: state[obj.field + i] })
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
                setState({ ...state, [obj.field + i]: '' })
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

            setState({ ...state, toastMsg: 'Solicitação de cadastro enviada', confirmToast: true })
            //setTimeout(() => { resetState() }, 1500);
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
            setState({ ...state, toastMsg: 'Solicitação indeferida!', confirmToast: true })
            setTimeout(() => {
                props.history.push('/solicitacoes')
            }, 1500);
        }
        //Aprova alteração de procuradores/procuração
        if (approved === true) {
            newMembers = humps.decamelizeKeys(newMembers)
            oldMembers = humps.decamelizeKeys(oldMembers)
            approveProc(newMembers, oldMembers)
        }
    }

    const approveProc = async (newMembers, oldMembers) => {
        const { selectedEmpresa, demandFiles, vencimento, demand } = state
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

        toast()
        if (demand)
            setTimeout(() => {
                props.history.push('/solicitacoes')
            }, 1500);
        resetState()
    }

    const deleteProcuracao = async proc => {
        const id = proc.procuracaoId
        const selectedFile = props.redux.empresaDocs.find(f => Number(f.metadata.procuracaoId) === id)

        await axios.delete(`/api/procuracoes?id=${id}`)

        if (selectedFile && selectedFile.hasOwnProperty('id')) {
            axios.delete(`/api/deleteFile?collection=empresaDocs&id=${selectedFile.id}`)
                .then(({ data }) => console.log(data))
        }
    }

    const handleFiles = files => {
        //limit file Size
        if (sizeExceedsLimit(files)) return

        let procuracao = new FormData()
        procuracao.append('procuracao', files[0])
        setState({ ...state, procuracao, fileToRemove: null })
    }

    const removeFile = async (name) => {
        const
            { procuracao } = state,
            newState = globalRemoveFile(name, procuracao)

        setState({ ...state, ...newState })
    }

    const getFile = id => {
        const
            { empresaDocs } = props.redux,
            selectedFile = empresaDocs.find(f => Number(f.metadata.procuracaoId) === id)

        if (selectedFile) {
            const { id, filename } = selectedFile
            download(id, filename, 'empresaDocs')
        } else {
            setState({ ...state, alertType: 'filesNotFound', openAlertDialog: true })
        }
    }

    const plusOne = () => {
        let i = [...state.procsToAdd]
        i.push(1)
        setState({ ...state, procsToAdd: i })
    }

    const minusOne = () => {
        let i = [...state.procsToAdd]
        i.pop()
        setState({ ...state, procsToAdd: i })
    }

    const checkExpires = () => {
        if (state.expires === true) {
            setState({ ...state, vencimento: '' })
        }
        setState({ ...state, expires: !state.expires })
    }

    const resetState = () => {
        const { procsToAdd } = state
        const keys = procuradorForm.map(({ field }) => field)
        const resetedFields = {}

        procsToAdd.forEach((p, i) => {
            keys.forEach(key => {
                if (state.hasOwnProperty(key + i))
                    resetedFields[key + i] = undefined
            })
        })
        removeFile('procuracao')
        setState({
            ...state,
            ...resetedFields,
            dropDisplay: 'Clique ou arraste para anexar a procuração referente a este(s) procurador(es).',
            procsToAdd: [1],
            vencimento: undefined,
            procuracao: undefined,
            expires: false
        })
    }

    const setShowPendencias = () => setState({ ...state, showPendencias: !state.showPendencias })
    const toggleDialog = () => setState({ ...state, openDialog: !state.openDialog })
    const closeAlert = () => setState({ ...state, openAlertDialog: !state.openAlertDialog })
    const toast = () => setState({ ...state, confirmToast: !state.confirmToast })
    const { openAlertDialog, alertType } = state
    return (
        <React.Fragment>
            <Crumbs links={['Empresas', '/empresas']} text='Cadastro de procurações' demand={demand} />
            <ProcuracoesTemplate
                data={state}
                redux={props.redux}
                selectedEmpresa={selectedEmpresa}
                handleInput={handleInput}
                deleteProcuracao={deleteProcuracao}
                handleFiles={handleFiles}
                removeFile={removeFile}
                addProc={addProc}
                plusOne={plusOne}
                minusOne={minusOne}
                getFile={getFile}
                checkExpires={checkExpires}
                setShowPendencias={setShowPendencias}
            />
            <ReactToast open={state.confirmToast} close={toast} msg={state.toastMsg} />
            {
                openAlertDialog &&
                <AlertDialog open={openAlertDialog} close={closeAlert} alertType={alertType} customMessage={state.customMsg} />
            }
        </React.Fragment>
    )
}

const collections = ['empresas', 'procuradores', 'procuracoes', 'getFiles/empresaDocs']

export const Procuracoes = (StoreHOC(collections, ProcuradoresContainer))

