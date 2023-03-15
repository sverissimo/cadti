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
import { altContratoForm, altContratoFiles, sociosForm, dadosEmpresaForm } from './forms'
import { createUpdateObject } from './utils/createUpdateObject'
import { createLog } from './utils/createLog'
import { logGenerator } from '../../Utils/logGenerator'
import { handleFiles as globalHandleFiles, removeFile as globalRemoveFile } from '../../Utils/handleFiles'
import valueParser from '../../Utils/valueParser'
import { toInputDate } from '../../Utils/formatValues'
import { submitFiles } from './utils/submitFiles'
import { createSociosUpdate } from './utils/createSociosUpdate'

const AltContrato = (props) => {
    const socios = useMemo(() => [...props.redux.socios], [props.redux.socios])
    const empresas = useMemo(() => props.redux.empresas, [props.redux.empresas])
    const empresaDocs = useMemo(() => props.redux.empresaDocs, [props.redux.empresaDocs])
    const [state, setState] = useState({
        razaoSocial: '',
        dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social ',
        confirmToast: false,
        showPendencias: false,
    })

    const demand = props?.location?.state?.demand
    const { inputValidation } = props.redux.parametros[0]
    const prevSelectedEmpresa = useRef(state.selectedEmpresa)

    const { activeStep, setActiveStep } = useStepper()
    const shareSum = useShareSum()
    const { checkBlankInputs, checkDuplicate } = useInputErrorHandler()
    const { alertObj, alertTypes, createAlert, closeAlert } = useAlertDialog()
    const { filterSocios, filteredSocios, updateSocios, clearedForm, addNewSocio,
        enableEdit, handleEdit, removeSocio } = useManageSocios(socios)

    useEffect(() => {
        if (empresas?.length === 1 && !state.selectedEmpresa) {
            const selectedEmpresa = { ...empresas[0] }
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)
            setState(state => ({ ...state, ...selectedEmpresa, selectedEmpresa, razaoSocialEdit: selectedEmpresa.razaoSocial }))
        }
    }, [empresas, state.selectedEmpresa])

    useEffect(() => {
        if (demand) {
            return
        }

        const selectedEmpresa = state.selectedEmpresa
        if (selectedEmpresa) {
            prevSelectedEmpresa.current = selectedEmpresa
            filterSocios(selectedEmpresa)
            setState(state => ({ ...state, ...selectedEmpresa, selectedEmpresa, razaoSocialEdit: selectedEmpresa.razaoSocial }))
        }

        if (prevSelectedEmpresa.current && !selectedEmpresa) {
            unselectEmpresa()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.selectedEmpresa, demand, filterSocios])

    useEffect(() => {
        if (demand?.history.length) {
            const { altContrato, altEmpresa, files } = demand?.history[0]
            const selectedEmpresa = empresas.find(e => e.codigoEmpresa === demand.empresaId)
            const alteredFields = altEmpresa && Object.keys(altEmpresa)
            const updatedEmpresa = { ...selectedEmpresa, ...altEmpresa }
            const demandFiles = files && empresaDocs.filter(d => files.includes(d.id))
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)

            updateSocios(selectedEmpresa, demand)
            setActiveStep(3)
            setState(state => ({ ...state, ...updatedEmpresa, ...altContrato, selectedEmpresa, alteredFields, demandFiles }))
        }
    }, [demand, empresas, setActiveStep, updateSocios, empresaDocs])

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
        const { name } = e.target
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
            if (selectedEmpresa) {
                selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa.vencimentoContrato)
            }
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

    const createDemand = async (log) => {
        const { numeroAlteracao, selectedEmpresa, form } = state
        if (form) {
            const files = await submitFiles({
                numeroAlteracao,
                empresaId: selectedEmpresa.codigoEmpresa,
                formData: form,
            })

            if (files.length) {
                log.history.files = files.map(f => f.id)
            }
        }

        logGenerator(log).catch(err => console.log(err))
        toast('Solicitação de alteração contratual enviada.')
        await new Promise(resolve => {
            resetState()
            setActiveStep(0)
            setTimeout(() => resolve(), 900);
        })
        return
    }

    const handleSubmit = async (approved) => {
        if (approved === false) {
            toast('Solicitação indeferida.')
            setTimeout(() => { props.history.push('/solicitacoes') }, 1500);
            return
        }
        const { form, selectedEmpresa } = state
        const { codigoEmpresa } = selectedEmpresa
        const altEmpresa = createUpdateObject('altEmpresa', state, demand)
        const altContrato = createUpdateObject('altContrato', state, demand)
        const socioUpdates = createSociosUpdate(filteredSocios, demand)
        const log = createLog({ state, demand, altEmpresa, altContrato, socioUpdates, approved })

        if (!demand && !altContrato && !altEmpresa && !form && !socioUpdates) {
            alert('Nenhuma modificação registrada!')
            return
        }
        if (!demand) {
            await createDemand(log)
            return
        }
        if (altEmpresa) {
            axios.patch('/api/empresas', altEmpresa)
        }
        if (altContrato) {
            axios.post('/api/altContrato', altContrato)
        }

        if (socioUpdates) {
            const { newSocios, modifiedSocios } = socioUpdates
            const newIDs = []

            if (!!newSocios.length) {
                const { data: ids } = await axios.post('/api/socios', { socios: newSocios, codigoEmpresa })
                newIDs.push(...ids)
            }
            if (!!modifiedSocios.length) {
                await axios.put('/api/socios', { socios: modifiedSocios, codigoEmpresa })
            }
            if (state.demandFiles) {
                const sociosIds = filteredSocios
                    .filter(s => !!s.socioId && s.status !== 'deleted')
                    .map(s => s.socioId)
                    .concat(newIDs)
                Object.assign(log, { metadata: { socios: sociosIds } })
            }
        }

        logGenerator(log).catch(err => console.log(err))
        setTimeout(() => { props.history.push('/solicitacoes') }, 1500);
        toast('Dados atualizados')
    }

    const handleFiles = async (files, name) => {
        if (files && files[0]) {
            const fileObj = { ...state, [name]: files[0] }
            const newState = globalHandleFiles(files, fileObj, altContratoFiles)
            setState({ ...state, ...newState, [name]: files[0], fileToRemove: null })
        }
    }

    const removeFile = async (name) => {
        const { form } = state
        const newState = globalRemoveFile(name, form)
        setState({ ...state, ...newState })
    }

    const resetState = () => {
        const resetForms = {}
        const forms = [altContratoForm, sociosForm, dadosEmpresaForm]

        let clearedState = {}

        forms.forEach(form => {
            form.forEach(({ field }) => {
                Object.assign(resetForms, { [field]: '' })
            })
        })

        setActiveStep(0)
        setState({
            ...resetForms, razaoSocial: '', selectedEmpresa: undefined, form: undefined,
            fileToRemove: undefined, ...clearedState
        })
    }

    const unselectEmpresa = () => {
        if (!demand && prevSelectedEmpresa.current) {
            const clearEmpresaFields = Object.keys(prevSelectedEmpresa.current)
                .reduce((prev, cur) => ({ ...prev, [cur]: undefined }), {})
            setState({ ...state, ...clearEmpresaFields, razaoSocial: state.razaoSocial })
        }
    }

    const toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg })
    const setShowPendencias = () => setState({ ...state, showPendencias: !state.showPendencias })

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
            <ReactToast open={state.confirmToast} close={toast} msg={state.toastMsg} />
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
