import React, { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'

import StoreHOC from '../../Store/StoreHOC'

import { useAlertDialog } from './hooks/useAlertDialog'
import { useInputErrorHandler } from './hooks/useInputErrorHandler'
import { useManageSocios } from './hooks/useManageSocios'
import { useShareSum } from './hooks/useShareSum'
import { useStepper } from './hooks/useStepper'

import AltContratoTemplate from './AltContratoTemplate'
import AlertDialog from '../../Reusable Components/AlertDialog'
import ReactToast from '../../Reusable Components/ReactToast'
import { altContratoForm, altContratoFiles, sociosForm } from './forms'
import { createUpdateObject } from './utils/createUpdateObject'
import { createLog } from './utils/createLog'
import { logGenerator } from '../../Utils/logGenerator'
import { handleFiles as globalHandleFiles, removeFile as globalRemoveFile } from '../../Utils/handleFiles'
import valueParser from '../../Utils/valueParser'
import { toInputDate } from '../../Utils/formatValues'

const AltContrato = props => {
    const socios = useMemo(() => [...props.redux.socios], [props.redux.socios])
    const { empresas } = props.redux
    const [state, setState] = useState({
        razaoSocial: '',
        dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social ',
        confirmToast: false,
        showPendencias: false,
    })

    const demand = props?.location?.state?.demand
    const { inputValidation } = props.redux.parametros[0]
    const { activeStep, setActiveStep } = useStepper()
    const shareSum = useShareSum()
    const { checkBlankInputs, checkDuplicate } = useInputErrorHandler()
    const { alertObj, alertTypes, createAlert, closeAlert } = useAlertDialog()
    const prevSelectedEmpresa = useRef(state.selectedEmpresa)
    const { filterSocios, filteredSocios, setSocios, updateSocios, clearedForm, addNewSocio,
        enableEdit, handleEdit, removeSocio } = useManageSocios(socios)

    useEffect(() => {
        if (empresas && empresas.length === 1) {
            const selectedEmpresa = { ...empresas[0] }
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa?.vencimentoContrato)
            setActiveStep(2)
            setSocios(socios)
            setState({ ...state, ...selectedEmpresa, selectedEmpresa })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (demand?.history.length) {
            const { empresaDocs } = props.redux
            const { altContrato, altEmpresa, files } = demand?.history[0]
            const selectedEmpresa = empresas.find(e => e.codigoEmpresa === demand.empresaId)
            const alteredFields = altEmpresa && Object.keys(altEmpresa)
            const updatedEmpresa = { ...selectedEmpresa, ...altEmpresa }

            updateSocios(selectedEmpresa, demand)
            let demandFiles
            if (files) {
                demandFiles = empresaDocs.filter(d => files.includes(d.id))
            }

            setState(() => ({
                ...state, ...altContrato, ...updatedEmpresa, selectedEmpresa, alteredFields,
                demandFiles
            }))
            setActiveStep(3)
        }
    }, [demand])

    useEffect(() => {
        if (!demand) {
            const { selectedEmpresa } = state
            if (selectedEmpresa) {
                const { vencimentoContrato } = selectedEmpresa
                selectedEmpresa.vencimentoContrato = toInputDate(vencimentoContrato)
                prevSelectedEmpresa.current = selectedEmpresa

                filterSocios(selectedEmpresa)
                setState({ ...state, ...selectedEmpresa, selectedEmpresa, razaoSocialEdit: selectedEmpresa.razaoSocial })
            }
        }

        if (prevSelectedEmpresa.current && !state.selectedEmpresa) {
            unselectEmpresa()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.selectedEmpresa])

    const changeStep = (action) => {
        const errors = checkBlankInputs(activeStep, state)
        if (inputValidation && errors && action === 'next') {
            createAlert(alertTypes.FIELDS_MISSING)
            return
        }

        if (shareSum > 100) {
            createAlert(alertTypes.OVERSHARED)
            setState({ ...state, share: '' })
            return
        }

        return setActiveStep(action)
    }

    const handleBlur = e => {
        const { name, value } = e.target
        if (name === 'razaoSocialEdit') {
            setState(s => ({ ...s, razaoSocial: value }))
        }

        if (name === 'cpfSocio') {
            const errors = checkDuplicate(state.cpfSocio, filteredSocios)
            if (errors) {
                createAlert(alertTypes.DUPLICATE_CPF)
                setState({ ...state, cpfSocio: '' })
            }
        }
    }

    const handleInput = e => {
        const { name, value } = e.target
        let selectedEmpresa
        if (name === 'razaoSocial') {
            selectedEmpresa = empresas.find(e => e.razaoSocial === value)
            setState({ ...state, selectedEmpresa, [name]: value })
            return
        }

        const parsedValue = valueParser(name, value)
        setState({ ...state, [name]: parsedValue })
    }

    const addSocio = async () => {
        if (shareSum > 100) {
            createAlert(alertTypes.OVERSHARED)
            setState({ ...state, share: '' })
            return
        }
        const errors = checkBlankInputs(activeStep, state)
        if (errors) {
            createAlert('fieldsMissing')
            return
        }

        addNewSocio(state)
        setState({ ...state, ...clearedForm })
    }

    const handleSubmit = async approved => {
        const { form, selectedEmpresa } = state
        const { codigoEmpresa } = selectedEmpresa
        const altEmpresa = createUpdateObject('altEmpresa', state)
        const altContrato = createUpdateObject('altContrato', state)
        const socioUpdates = createUpdateObject('socios', { filteredSocios, demand })
        const log = createLog({ state, demand, altEmpresa, altContrato, socioUpdates, approved })
        const socioIds = []
        let toastMsg = 'Solicitação de alteração contratual enviada.'

        if (!demand && !altContrato && !altEmpresa && !form && !socioUpdates) {
            alert('Nenhuma modificação registrada!')
            return
        }

        if (demand && approved) {
            if (altEmpresa) {
                axios.patch('/api/empresas', altEmpresa)
            }
            if (altContrato) {
                axios.post('/api/altContrato', altContrato)
            }
            if (socioUpdates) {
                const newSocios = socioUpdates.filter(s => s.status === 'new')
                    .map(s => ({ ...s, status: undefined }))
                if (newSocios.length) {
                    const { data: ids } = await axios.post('/api/socios', { socios: newSocios, codigoEmpresa })
                    socioIds.push(...ids)         //A array de ids de sócios vai para a metadata dos arquivos
                }

                const updates = socioUpdates.filter(s => s.status !== 'new')
                if (updates.length) {
                    await axios.put('/api/socios', { socios: updates, codigoEmpresa })
                    const ids = updates.map(s => s.socioId)
                    socioIds.push(...ids)
                }
                //A array de ids de sócios vai para a metadata dos arquivos
                if (socioIds.length) {
                    console.log("🚀 ~ file: AltContrato.jsx:196 ~ handleSubmit ~ socioIds:", socioIds)
                    const unchangedSociosIds = filteredSocios
                        .filter(s => s?.socioId && !socioIds.includes(s.socioId) && s?.status !== 'deleted')
                        .map(s => s.socioId)
                    const allSociosIds = socioIds.concat(unchangedSociosIds)
                    Object.assign(log, { metadata: { socios: allSociosIds } })
                }
                toastMsg = 'Dados atualizados'
            }
        }
        // AO CRIAR A DEMANDA, NÃO ESTÁ PREENCHENDO A ARRAY DE SÓCIOS E ESTÁ DANDO TEMP: FALSE DE CARA
        if (!approved) {
            //Adiciona os demais sócios para o metadata dos arquivos, para relacionar as alterações contratuais com todos os sócios
            const unchangedSociosIds = filteredSocios
                .filter(s => s?.socioId && !socioIds.includes(s.socioId) && s?.status !== 'deleted')
                .map(s => s.socioId)
            const allSociosIds = socioIds.concat(unchangedSociosIds)

            const files = await submitFile(codigoEmpresa, allSociosIds) //A função deve retornar o array de ids dos files para incorporar no log.

            if (files instanceof Array) {
                log.history.files = files.map(f => f.id)
            }
        }

        logGenerator(log).then(r => console.log(r?.data))
            .catch(err => console.log(err))

        if (demand)
            setTimeout(() => { props.history.push('/solicitacoes') }, 1500);
        else
            setTimeout(() => { resetState() }, 900);

        if (approved === false) toastMsg = 'Solicitação indeferida.'
        toast(toastMsg)
    }

    const handleFiles = async (files, name) => {
        if (files && files[0]) {
            const fileObj = { ...state, [name]: files[0] }
            const newState = globalHandleFiles(files, fileObj, altContratoFiles)
            setState({ ...state, ...newState, [name]: files[0], fileToRemove: null })
        }
    }

    const submitFile = async (empresaId, socioIds) => {
        //Essa função só é chamada ao CRIAR a demanda. Por isso, tempFile é true e o SocioIds deve ser preenchido aqui
        const { form, numeroAlteracao } = state
        const files = []

        if (form instanceof FormData) {
            const metadata = {
                empresaId,
                tempFile: true
            }
            let filesToSend = new FormData()
            //O loop é para cada arquivo ter seu fieldName correto no campo metadata
            for (let pair of form) {
                const name = pair[0]

                //O CRC não precisa dos ids dos sócios nem do número de alteração em seu metadata
                if (name === "altContratoDoc") {
                    const altContMeta = {
                        ...metadata,
                        fieldName: name,
                        socios: socioIds,
                        numeroAlteracao
                    }
                    filesToSend.append('metadata', JSON.stringify(altContMeta))
                }
                else {
                    const crcMeta = {
                        ...metadata,
                        fieldName: name
                    }
                    filesToSend.append('metadata', JSON.stringify(crcMeta))
                }
                filesToSend.set(name, pair[1])
                await axios.post('/api/empresaUpload', filesToSend)
                    .then(r => {
                        console.log(r)
                        if (r?.data?.file instanceof Array)
                            files.push(...r?.data?.file)
                    })
                    .catch(err => console.log(err))
                filesToSend = new FormData()
            }
            return files
        }
    }

    const removeFile = async (name) => {
        const
            { form } = state,
            newState = globalRemoveFile(name, form)
        setState({ ...state, ...newState })
    }

    const resetState = () => {
        const resetForms = {}
        const forms = [altContratoForm, sociosForm]

        let clearedState = {}

        forms.forEach(form => {
            form.forEach(({ field }) => {
                Object.assign(resetForms, { [field]: '' })
            })
        })
        unselectEmpresa()
        //Se for só uma empresa, volta para o estado inicial (para procuradores de apenas uma empresa)
        if (empresas && empresas.length === 1) {
            clearedState = { ...empresas[0], selectedEmpresa: empresas[0] }
            filterSocios(empresas[0])
        }

        setState({
            ...resetForms, activeStep: 0, razaoSocial: '', selectedEmpresa: undefined,
            form: undefined, fileToRemove: undefined, ...clearedState
        })
    }

    const unselectEmpresa = () => {
        if (!demand) {
            const clearEmpresaFields = Object.keys(prevSelectedEmpresa.current)
                .reduce((prev, cur) => ({ ...prev, [cur]: undefined }), {})
            setState({ ...state, ...clearEmpresaFields, razaoSocial: state.razaoSocial })
        }
    }

    const toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg })
    const setShowPendencias = () => setState({ ...state, showPendencias: !state.showPendencias })

    const { confirmToast, toastMsg } = state

    return (
        <>
            <AltContratoTemplate
                empresas={empresas}
                data={state}
                demand={demand}
                activeStep={activeStep}
                setActiveStep={changeStep}
                handleInput={handleInput}
                handleBlur={handleBlur}
                handleSubmit={handleSubmit}
                handleFiles={handleFiles}
                removeFile={removeFile}
                filteredSocios={filteredSocios}
                addSocio={addSocio}
                removeSocio={removeSocio}
                enableEdit={enableEdit}
                handleEdit={handleEdit}
                setShowPendencias={setShowPendencias}
            />
            <ReactToast open={confirmToast} close={toast} msg={toastMsg} />
            {
                alertObj.openAlertDialog &&
                <AlertDialog
                    open={alertObj.openAlertDialog}
                    close={closeAlert}
                    customMessage={alertObj.customMessage}
                    customTitle={alertObj.customTitle}
                />
            }
        </>
    )
}

const collections = ['empresas', 'socios', 'getFiles/empresaDocs']
export default (StoreHOC(collections, AltContrato))
