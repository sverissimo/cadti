import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

import { useAlertDialog, useInputErrorHandler, useManageSocios, useSelectEmpresa, useShareSum, useStepper } from './hooks'
import { altContratoForm, altContratoFiles, sociosForm, dadosEmpresaForm } from './forms'
import { createLog, createSociosUpdate, createUpdateObject, submitFiles } from './utils'
import { logGenerator } from '../../Utils/logGenerator'
import { handleFiles as globalHandleFiles, removeFile as globalRemoveFile } from '../../Utils/handleFiles'
import valueParser from '../../Utils/valueParser'

const AltContrato = (props) => {
    const socios = useMemo(() => [...props.redux.socios], [props.redux.socios])
    const empresas = useMemo(() => props.redux.empresas, [props.redux.empresas])
    const empresaDocs = useMemo(() => props.redux.empresaDocs, [props.redux.empresaDocs])
    const [state, setState] = useState({
        dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social ',
        confirmToast: false,
        showPendencias: false,
    })

    const demand = props?.location?.state?.demand
    const { inputValidation } = props.redux.parametros[0]
    const { selectedEmpresa, selectEmpresa, setEmpresaFromDemand, prevSelectedEmpresa, unselectEmpresa } = useSelectEmpresa(empresas, demand)
    const { activeStep, setActiveStep } = useStepper()
    const shareSum = useShareSum()
    const { checkBlankInputs, checkDuplicate } = useInputErrorHandler()
    const { alertObj, alertTypes, createAlert, closeAlert } = useAlertDialog()
    const { filterSocios, filteredSocios, updateSocios, clearedForm, addNewSocio,
        enableEdit, handleEdit, removeSocio } = useManageSocios(socios)

    useEffect(() => {
        if (demand) {
            return
        }

        if (selectedEmpresa) {
            filterSocios(selectedEmpresa)
            setState({ ...state, ...selectedEmpresa, razaoSocialEdit: selectedEmpresa.razaoSocial })
        }

        if (prevSelectedEmpresa && !selectedEmpresa) {
            const clearedFields = unselectEmpresa()
            setState(s => ({ ...s, ...clearedFields, razaoSocial: state.razaoSocial }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEmpresa, demand, filterSocios, prevSelectedEmpresa])

    useEffect(() => {
        if (demand?.history.length) {
            const { altContrato, files } = demand?.history[0]
            const demandFiles = files && empresaDocs.filter(d => files.includes(d.id))
            const { selectedEmpresa, alteredFields, updatedEmpresa } = setEmpresaFromDemand()

            updateSocios(selectedEmpresa, demand)
            setActiveStep(3)
            setState(state => ({ ...state, ...updatedEmpresa, ...altContrato, alteredFields, demandFiles }))
        }
    }, [demand, setEmpresaFromDemand, setActiveStep, updateSocios, empresaDocs])

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
        if (name === 'razaoSocial') {
            selectEmpresa(value)
        }

        const parsedValue = valueParser(name, value)
        setState(s => ({ ...s, [name]: parsedValue }))
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
        const { numeroAlteracao, form } = state
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
        await new Promise(resolve => setTimeout(() => resolve(), 900))
        resetState()
        setActiveStep(0)
        return
    }

    const handleSubmit = async (approved) => {
        if (approved === false) {
            toast('Solicitação indeferida.')
            setTimeout(() => { props.history.push('/solicitacoes') }, 1500);
            return
        }
        const data = { ...state, selectedEmpresa }
        const { codigoEmpresa } = selectedEmpresa
        const altEmpresa = createUpdateObject('altEmpresa', data, demand)
        const altContrato = createUpdateObject('altContrato', data, demand)
        const socioUpdates = createSociosUpdate(filteredSocios, demand)
        const log = createLog({ state: data, demand, altEmpresa, altContrato, socioUpdates, approved })

        if (!demand && !altContrato && !altEmpresa && !state.form && !socioUpdates) {
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
        toast('Dados atualizados')
        setTimeout(() => { props.history.push('/solicitacoes') }, 1500);
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
        forms.forEach(form => {
            form.forEach(({ field }) => {
                Object.assign(resetForms, { [field]: '' })
            })
        })

        setActiveStep(0)
        setState({ ...resetForms, razaoSocial: '', form: undefined, fileToRemove: undefined, })
    }

    const toast = toastMsg => setState(s => ({ ...s, confirmToast: !s.confirmToast, toastMsg }))
    const setShowPendencias = () => setState({ ...state, showPendencias: !state.showPendencias })

    return {
        empresas,
        selectedEmpresa,
        demand,
        handleInput,
        handleBlur,
        handleSubmit,
        handleFiles,
        removeFile,
        filteredSocios,
        addSocio,
        removeSocio,
        enableEdit,
        handleEdit,
        setShowPendencias,
        alertObj,
        closeAlert,
        toast,
        activeStep,
        data: state,
        setActiveStep: changeStep,
    }
}

export default AltContrato
