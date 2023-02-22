import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

import StoreHOC from '../../Store/StoreHOC'
import AltContratoTemplate from './AltContratoTemplate'
import ReactToast from '../../Reusable Components/ReactToast'
import { logGenerator } from '../../Utils/logGenerator'
import { handleFiles as globalHandleFiles, removeFile as globalRemoveFile } from '../../Utils/handleFiles'
import valueParser from '../../Utils/valueParser'

import { altContratoForm, altContratoFiles, empresasForm, sociosForm, dadosEmpresaForm } from './forms'
import { toInputDate } from '../../Utils/formatValues'
import { useShareSum } from './hooks/useShareSum'
import { useAlertDialog } from './hooks/useAlertDialog'
import { useStepper } from './hooks/useStepper'
import { useInputErrorHandler } from './hooks/useInputErrorHandler'
import { createUpdateObject } from './utils/createUpdateObject'
import AlertDialog from '../../Reusable Components/AlertDialog'


const AltContrato = props => {
    const { empresas } = props.redux
    const socios = [...props.redux.socios]
    const [state, setState] = useState({
        razaoSocial: '',
        dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social ',
        demand: undefined,
        confirmToast: false,
        filteredSocios: [],
        showPendencias: false,
    })

    const { inputValidation } = props.redux.parametros[0]
    const { checkBlankInputs, checkDuplicate } = useInputErrorHandler()
    const { alertObj, alertTypes, createAlert, closeAlert } = useAlertDialog()
    const { activeStep, setActiveStep } = useStepper()
    const shareSum = useShareSum()
    const prevSelectedEmpresa = useRef(state.selectedEmpresa)
    const demand = props?.location?.state?.demand

    useEffect(() => {
        if (empresas && empresas.length === 1) {
            const selectedEmpresa = { ...empresas[0] }
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa?.vencimentoContrato)

            setState({ ...state, ...selectedEmpresa, selectedEmpresa, filteredSocios: socios })
        }

        return () => void 0
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (demand?.history.length) {
            //console.log("🚀 ~ file: AltContrato.jsx:65 ~ useEffect ~ demand", demand)
            const { empresaDocs } = props.redux
            const { altContrato, altEmpresa, socioUpdates, files } = demand?.history[0]
            const selectedEmpresa = empresas.find(e => e.codigoEmpresa === demand.empresaId)
            const alteredFields = altEmpresa && Object.keys(altEmpresa)

            const updatedEmpresa = { ...selectedEmpresa, ...altEmpresa }
            const selectSocios = socios.filter(s => s.empresas
                && s.empresas[0]
                && s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa)
            )
            const filteredSocios = JSON.parse(JSON.stringify(selectSocios))
            let updatedSocios

            if (socioUpdates && socioUpdates[0]) {
                const newSocios = socioUpdates.filter(s => s.status === 'new' || s.outsider)
                updatedSocios = filteredSocios.map(socio => {
                    const updatedSocio = socioUpdates.find(({ socioId }) => socioId === socio.socioId) || {}
                    return { ...socio, ...updatedSocio }
                })
                    .concat(newSocios)
                    .sort((a, b) => a.nomeSocio.localeCompare(b.nomeSocio))
            }

            let demandFiles
            if (files) {
                demandFiles = empresaDocs.filter(d => files.includes(d.id))
            }

            setState(() => ({
                ...state, ...altContrato, ...updatedEmpresa, selectedEmpresa, demand, alteredFields,
                demandFiles, filteredSocios: updatedSocios
            }))
            setActiveStep(3)
        }
    }, [demand])

    //Armazena uma cópia dos sócios antes de qualquer edição para avaliar se houve mudança e fazer ou não o request
    useEffect(() => {
        if (!demand) {
            const { selectedEmpresa } = state
            if (selectedEmpresa) {

                const { codigoEmpresa, vencimentoContrato } = selectedEmpresa
                selectedEmpresa.vencimentoContrato = toInputDate(vencimentoContrato)

                const originalSocios = JSON.parse(JSON.stringify(socios.filter(s => s.empresas && s.empresas[0] && s.empresas.some(e => e.codigoEmpresa === codigoEmpresa))))
                const filteredSocios = socios
                    .filter(s => s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa))
                    .map(s => {
                        const { share } = s.empresas.find(e => e.codigoEmpresa === codigoEmpresa)
                        return { ...s, share }
                    })

                prevSelectedEmpresa.current = selectedEmpresa
                setState({ ...state, ...selectedEmpresa, originalSocios, selectedEmpresa, razaoSocialEdit: selectedEmpresa.razaoSocial, filteredSocios })
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

        return setActiveStep(action)
    }

    const handleBlur = e => {
        const { name, value } = e.target
        if (name === 'razaoSocialEdit') {
            setState(s => ({ ...s, razaoSocial: value }))
        }

        if (name === 'cpfSocio') {
            const errors = checkDuplicate(state.cpfSocio, state.filteredSocios)
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

    const enableEdit = (index) => {
        const { filteredSocios } = state
        const socio = filteredSocios[index]
        if (shareSum > 100) {
            socio.share = ''
            createAlert('overShared')
            return
        }

        socio.edit = !socio.edit
        filteredSocios.forEach(s => (s !== socio && s.edit) ? s.edit = false : void 0)
        setState({ ...state, filteredSocios })
    }

    const handleEdit = e => {
        const { name } = e.target
        const { filteredSocios } = state
        let { value } = e.target

        if (name === 'share') {
            value = value.replace(',', '.')
        }

        const fs = [...filteredSocios]
        const editSocio = fs.find(s => s.edit === true)

        if (!editSocio) {
            return
        }

        const parsedValue = valueParser(name, value)
        editSocio[name] = parsedValue
        //Acrescenta o status do sócio modificado, caso não seja === "new" nem === "deleted"
        if (!editSocio.status) {
            editSocio.status = 'modified'
        }
        editSocio.share = name === 'share' && +value

        //const errors = checkForErrors() || {}
        setState({ ...state, filteredSocios: fs })
    }

    const addSocio = async () => {
        const socios = [...state.filteredSocios]
        const addedSocio = { status: 'new' }

        if (shareSum > 100) {
            createAlert(alertTypes.OVERSHARED)
            setState({ ...state, share: '' })
            return
        }

        sociosForm.forEach(({ field }) => {
            Object.assign(addedSocio, { [field]: state[field] })
        })

        const errors = checkBlankInputs(activeStep, state)
        if (errors) {
            createAlert('fieldsMissing')
            return
        }

        const { data: existingSocio } = await axios.post('/api/checkSocios', { newCpfs: [addedSocio?.cpfSocio] })
        if (existingSocio && !Array.isArray(existingSocio)) {
            const { socio_id: socioId, empresas } = existingSocio
            const update = {
                socioId,
                status: 'modified',
                outsider: true,
                empresas
            }
            Object.assign(addedSocio, { ...update })
        }

        if (addedSocio.share) {
            addedSocio.share = +addedSocio.share
        }

        socios.push(addedSocio)
        console.log("🚀 ~ file: AltContrato.jsx:233 ~ addSocio ~ addedSocio", addedSocio)
        socios.sort((a, b) => a.nomeSocio.localeCompare(b.nomeSocio))

        const clearForm = {}
        sociosForm.forEach(obj => clearForm[obj.field] = '')
        setState({ ...state, ...clearForm, filteredSocios: socios })
    }

    const removeSocio = index => {
        const
            { filteredSocios, demand } = state,
            socioToRemove = filteredSocios[index]

        if (socioToRemove?.status === 'new' || (!demand && socioToRemove.outsider)) {
            filteredSocios.splice(index, 1)
            setState({ ...state, filteredSocios })
        }
        else {
            if (socioToRemove?.status && socioToRemove?.status !== 'deleted') {
                socioToRemove.originalStatus = socioToRemove.status
                socioToRemove.status = 'deleted'
            }
            else if (socioToRemove?.status === 'deleted')
                socioToRemove.status = socioToRemove?.originalStatus
            else
                socioToRemove.status = 'deleted'

            setState({ ...state, filteredSocios })
        }
    }

    const handleSubmit = async approved => {
        const { demand, form, selectedEmpresa } = state
        const { codigoEmpresa } = selectedEmpresa
        const altEmpresa = createUpdateObject('altEmpresa', state)
        const altContrato = createUpdateObject('altContrato', state)
        const socioUpdates = createUpdateObject('socios', state)
        const log = createLog({ demand, altEmpresa, altContrato, socioUpdates, approved })

        let socioIds = []
        let toastMsg = 'Solicitação de alteração contratual enviada.'

        console.log("🚀 ~ file: AltContrato.jsx:320 ~ handleSubmit ~ !demand && !altContrato && !altEmpresa && !form && !socioUpdates", socioUpdates)

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
                    await axios.post('/api/socios', { socios: newSocios, codigoEmpresa })
                    // const { data: ids } = await axios.post('/api/socios', { socios: newSocios, codigoEmpresa })
                    //   socioIds.push(ids)         //A array de ids de sócios vai para a metadata dos arquivos
                }

                //Status 'deleted' não são apagados, apenas têm sua coluna 'empresas' atualizada.
                const updates = socioUpdates.filter(s => s.status !== 'new')
                if (updates.length) {
                    await axios.put('/api/socios', { socios: updates, codigoEmpresa })
                    /* const ids = updates.map(s => s.socio_id)
                    socioIds = socioIds.concat(ids)             //A array de ids de sócios vai para a metadata dos arquivos */
                }

                if (socioIds.length) {
                    const unchangedSociosIds = filteredSocios
                        .filter(s => s?.socioId && !socioIds.includes(s.socioId) && s?.status !== 'deleted')
                        .map(s => s.socioId)
                    const allSociosIds = socioIds.concat(unchangedSociosIds)
                    Object.assign(log, { metadata: { socios: allSociosIds } })
                }
                toastMsg = 'Dados atualizados'
            }
        }
        let files, fileIds
        if (approved === false)
            toastMsg = 'Solicitação indeferida.'

        //***********************ERROR --- Se for p aprovar, o filesIds vai sempre ser undefined */
        // AO CRIAR A DEMANDA, NÃO ESTÁ PREENCHENDO A ARRAY DE SÓCIOS E ESTÁ DANDO TEMP: FALSE DE CARA

        else if (!approved) {
            //Adiciona os demais sócios para o metadata dos arquivos, para relacionar as alterações contratuais com todos os sócios
            const
                unchangedSociosIds = filteredSocios
                    .filter(s => s?.socioId && !socioIds.includes(s.socioId) && s?.status !== 'deleted')
                    .map(s => s.socioId)
                , allSociosIds = socioIds.concat(unchangedSociosIds)

            files = await submitFile(codigoEmpresa, allSociosIds) //A função deve retornar o array de ids dos files para incorporar no log.

            if (files instanceof Array) {
                fileIds = files.map(f => f.id)
                log.history.files = fileIds
            }
        }

        logGenerator(log)                               //Generate the demand
            .then(r => {
                console.log(r?.data)
            })
            .catch(err => console.log(err))
        console.log("🚀 ~ file: AltContrato.jsx:403 ~ handleSubmit ~ log", log)

        if (demand)
            setTimeout(() => {
                props.history.push('/solicitacoes')
            }, 1500);
        else
            setTimeout(() => { resetState() }, 900);
        toast(toastMsg)
    }

    const createLog = ({ demand, altEmpresa, altContrato, approved, socioUpdates }) => {
        const
            { selectedEmpresa, info } = state,
            { codigoEmpresa } = selectedEmpresa
        let log

        //Se não houver demanda, criar demanda/log
        if (!demand) {
            log = {
                history: {
                    altContrato,
                    info,
                    altEmpresa,
                    socioUpdates
                },
                empresaId: codigoEmpresa,
                historyLength: 0,
                approved
            }
            if (approved === false)
                log.declined = true
        }
        //Se houver demand, mas for rejeitada, indeferir demanda
        if (demand && approved === false) {
            const { id, empresaId } = demand
            log = {
                id,
                empresaId,
                history: {
                    info
                },
                declined: true
            }
        }
        //Se aprovado
        if (demand && approved === true) {
            const
                { id } = demand,
                { demandFiles } = state
            log = {
                id,
                demandFiles,
                history: {},
                approved
            }
        }
        return log
    }

    const handleFiles = async (files, name) => {

        if (files && files[0]) {
            const
                fileObj = { ...state, [name]: files[0] },
                newState = globalHandleFiles(files, fileObj, altContratoFiles)
            setState({ ...state, ...newState, [name]: files[0], fileToRemove: null })
        }
    }

    const submitFile = async (empresaId, socioIds) => {
        //Essa função só é chamada ao CRIAR a demanda. Por isso, tempFile é true e o SocioIds deve ser preenchido aqui
        const
            { form, numeroAlteracao } = state,
            files = []

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
        const
            resetForms = {},
            forms = [altContratoForm, sociosForm]

        let clearedState = {}

        forms.forEach(form => {
            form.forEach(({ field }) => {
                Object.assign(resetForms, { [field]: '' })
            })
        })
        unselectEmpresa()
        //Se for só uma empresa, volta para o estado inicial (para procuradores de apenas uma empresa)
        if (empresas && empresas.length === 1) {
            clearedState = { ...empresas[0], selectedEmpresa: empresas[0], filteredSocios: socios }
        }

        setState({
            ...resetForms, activeStep: 0, razaoSocial: '', selectedEmpresa: undefined,
            filteredSocios: [], form: undefined, fileToRemove: undefined, ...clearedState
        })
    }

    const unselectEmpresa = () => {
        const clearEmpresaFields = Object.keys(prevSelectedEmpresa.current)
            .reduce((prev, cur) => ({ ...prev, [cur]: undefined }), {})
        setState({ ...state, ...clearEmpresaFields, razaoSocial: state.razaoSocial })
    }

    const toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg })
    const setShowPendencias = () => setState({ ...state, showPendencias: !state.showPendencias })

    const { filteredSocios, confirmToast, toastMsg } = state

    return (
        <>
            <AltContratoTemplate
                empresas={empresas}
                data={state}
                activeStep={activeStep}
                setActiveStep={changeStep}
                handleInput={handleInput}
                handleBlur={handleBlur}
                handleSubmit={handleSubmit}
                handleFiles={handleFiles}
                removeFile={removeFile}
                socios={filteredSocios}
                addSocio={addSocio}
                removeSocio={removeSocio}
                enableEdit={enableEdit}
                handleEdit={handleEdit}
                setShowPendencias={setShowPendencias}
            />
            <ReactToast open={confirmToast} close={toast} msg={toastMsg} />
            {
                alertObj.openAlertDialog &&
                <AlertDialog open={alertObj.openAlertDialog} close={closeAlert} customMessage={alertObj.customMessage} customTitle={alertObj.customTitle} />
            }
        </>
    )
}
const collections = ['empresas', 'socios', 'getFiles/empresaDocs']
export default (StoreHOC(collections, AltContrato))