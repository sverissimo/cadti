import React, { useState, useEffect } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'
import AltContratoTemplate from './AltContratoTemplate'
import ReactToast from '../Reusable Components/ReactToast'
import { logGenerator } from '../Utils/logGenerator'
import { removeFile as globalRemoveFile, sizeExceedsLimit } from '../Utils/handleFiles'
import valueParser from '../Utils/valueParser'

import { altContratoForm } from '../Forms/altContratoForm'
import { empresasForm } from '../Forms/empresasForm'
import { sociosForm } from '../Forms/sociosForm'
import { setEmpresaDemand } from '../Utils/setEmpresaDemand'

const AltContrato = props => {

    const
        { empresas, socios } = props.redux,
        [state, setState] = useState({
            razaoSocial: '',
            activeStep: 0,
            stepTitles: ['Alterar dados da empresa', 'Informações sobre alteração do contrato social', 'Informações sobre sócios', 'Revisão'],
            subtitles: ['Utilize os campos abaixo caso deseje editar os dados da empresa',
                'Informe as alterações no contrato social e anexe uma cópia do documento',
                'Adicione ou altere sócios e suas respectivas participações.',
                'Revise os dados informados.'
            ],
            dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social ',
            demand: undefined,
            confirmToast: false,
            filteredSocios: [],
            showPendencias: false
            //selectedEmpresa: empresas[0],
            //filteredSocios: [socios[0], socios[1]],
        })

    //ComponentDidMount para carregar demand, se houver
    useEffect(() => {
        const
            demand = props?.location?.state?.demand,
            altContratoFields = {},
            { altContrato, socioUpdates, files } = demand?.history[0]


        if (demand) {
            const selectedEmpresa = empresas.find(e => e.empresaId === demand.codigoEmpresa)
            let filteredSocios = JSON.parse(JSON.stringify(socios.filter(s => s.codigoEmpresa === selectedEmpresa.codigoEmpresa)))

            if (altContrato) {
                altContratoForm.forEach(({ field }) => altContratoFields[field] = altContrato[field])
                console.log(demand, altContratoFields, selectedEmpresa)
            }
            if (socioUpdates) {
                const newSocios = []
                filteredSocios.forEach(fs => {
                    socioUpdates.forEach(us => {
                        if (fs.socioId === us?.socioId) {
                            Object.keys(us).forEach(k => {
                                fs[k] = us[k]
                            })
                        }
                        if (us.status === 'new' && !newSocios.includes(us))
                            newSocios.push(us)
                    })
                })
                filteredSocios = filteredSocios.concat(newSocios)
                console.log(filteredSocios)
            }
            setState({ ...state, ...altContrato, ...selectedEmpresa, demand, selectedEmpresa, filteredSocios, activeStep: 3 })
        }
    }, [])

    useEffect(() => {

        if (state.selectedEmpresa) {

            const codigoEmpresa = state.selectedEmpresa.codigoEmpresa,
                originalSocios = JSON.parse(JSON.stringify(socios.filter(s => s.codigoEmpresa === codigoEmpresa))) || []

            setState({ ...state, originalSocios })
            console.log(originalSocios)
        }
    }, [state.selectedEmpresa])

    const setActiveStep = action => {

        let activeStep = state.activeStep
        if (action === 'next') activeStep++
        if (action === 'back') activeStep--
        if (action === 'reset') activeStep = 0
        setState({ ...state, activeStep })

        if (activeStep === 3)
            checkSocioUpdates()
    }

    const handleInput = e => {
        const { name, value } = e.target
        let
            selectedEmpresa = {},
            filteredSocios

        if (name === 'razaoSocial') {
            selectedEmpresa = empresas.find(e => e.razaoSocial === value) || {}
            let venc = selectedEmpresa?.vencimentoContrato

            if (venc && venc.length > 0)
                selectedEmpresa.vencimentoContrato = venc.substr(0, 10)

            if (selectedEmpresa?.codigoEmpresa)
                filteredSocios = JSON.parse(JSON.stringify(socios.filter(s => s.codigoEmpresa === selectedEmpresa.codigoEmpresa)))

            setState({ ...state, ...selectedEmpresa, selectedEmpresa, filteredSocios, [name]: value })
        }
        else {
            const parsedValue = valueParser(name, value)
            setState({ ...state, [name]: parsedValue })
        }
    }

    const enableEdit = index => {

        let editSocio = state.filteredSocios
        if (editSocio[index].edit === true) {
            editSocio[index].edit = false
            checkSocioUpdates()
        }
        else {
            editSocio.forEach(s => s.edit = false)
            editSocio[index].edit = true
        }
        setState({ ...state, filteredSocios: editSocio })
    }

    const handleEdit = e => {
        const
            { name } = e.target,
            { filteredSocios } = state

        let { value } = e.target

        if (name === 'share')
            value = value.replace(',', '.')

        let editSocio = filteredSocios.find(s => s.edit === true)
        const index = filteredSocios.indexOf(editSocio)

        editSocio[name] = value

        const fs = filteredSocios
        fs[index] = editSocio

        setState({ ...state, filteredSocios: fs })
    }

    const addSocio = async () => {
        let socios = state.filteredSocios,
            sObject = {},
            invalid = 0,
            totalShare = 0

        sociosForm.forEach(obj => {
            if (state[obj.field] === '' || state[obj.field] === undefined) {
                invalid += 1
            }
        })

        if (invalid === 100) {
            setState({ ...state, alertType: 'fieldsMissing', openAlertDialog: true })
            return null
        }
        else {
            sociosForm.forEach(obj => {
                Object.assign(sObject, { [obj.field]: state[obj.field] })
            })
            sObject.status = 'new'
            socios.push(sObject)

            //Verifica se a soma das participações passou 100%
            socios.forEach(s => {
                totalShare += Number(s.share)
            })
            if (totalShare > 100) {
                socios.pop()
                setState({ ...state, alertType: 'overShared', openAlertDialog: true })
            }
            else {
                await setState({ ...state, filteredSocios: socios, totalShare })
                sociosForm.forEach(obj => {
                    setState({ ...state, [obj.field]: '' })
                })
                document.getElementsByName('nomeSocio')[0].focus()
            }
        }
    }

    const removeSocio = index => {
        const
            { filteredSocios } = state,
            socioToRemove = filteredSocios[index]

        if (socioToRemove?.status === 'new') {
            filteredSocios.splice(index, 1)
            setState({ ...state, filteredSocios })
        }
        else {
            if (socioToRemove.status && socioToRemove.status !== 'deleted') {
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

    const handleSubmit = approved => {
        const
            { demand } = state,
            altContrato = createRequestObj(altContratoForm),
            altEmpresa = createRequestObj(empresasForm)

        const
            socioUpdates = checkSocioUpdates(),
            empresaUpdates = updateEmpresa(altEmpresa),
            log = createLog({ demand, altContrato, socioUpdates, approved })

        console.log({ socioUpdates, empresaUpdates })
        /* 
                if (empresaUpdates)
                    axios.put('/api/editTableRow', empresaUpdates)
                if (socioUpdates)
                    console.log(socioUpdates)
                //axios.put('/api/editSocios', socioUpdates) 
        
                logGenerator(log)                               //Generate the demand
                    .then(r => {
                        console.log(r?.data)                        
                    })
                    .catch(err => console.log(err)) */

        toast('Solicitação de alteração contratual enviada.')
        setTimeout(() => { resetState() }, 900);

    }

    const checkSocioUpdates = () => {
        const { originalSocios, filteredSocios, demand } = state
        let
            socioUpdates = [],
            altObj = {}

        //verifica se houve alteração em sócios existentes e as insere em oldSocios ou se há novos sócios, inseridos em newSocios
        filteredSocios.forEach(m => {
            delete m.edit
            if (m.socioId) {
                originalSocios.forEach(async s => {
                    if (m.socioId === s.socioId) {
                        Object.keys(m).forEach(key => {
                            if (m[key] && m[key] !== '' && (m[key] !== s[key] || key === 'socioId')) {
                                Object.assign(altObj, { [key]: m[key] })
                            }
                        })
                        //if marked as deleted, preserve status to create delete request, else mark as modified.                        
                        if (Object.keys(altObj).length > 1) {
                            if (altObj?.status !== 'deleted') {
                                m.status = 'modified'
                                altObj.status = 'modified'
                            }
                            //Se os únicos campos forem socioId e status, não inserir em oldSocios. A não ser que seja deleted, aí registra p apagar depois
                            if (altObj.socioId && altObj.status && (altObj?.status === 'deleted' || Object.keys(altObj).length > 2))
                                socioUpdates.push(altObj)
                            else {
                                m.status = undefined
                                altObj.status = undefined
                            }

                        }
                        altObj = {}
                    }
                })
            }
            else
                socioUpdates.push(m)
        })
        if (!socioUpdates[0])
            socioUpdates = undefined
        console.log(socioUpdates)
        return socioUpdates
    }

    const updateEmpresa = altEmpresa => {
        const
            { selectedEmpresa } = state,
            { codigoEmpresa } = selectedEmpresa

        //Apaga propriedades === null ou inexistentes
        for (let prop in selectedEmpresa) {
            if (altEmpresa[prop] && altEmpresa[prop] === selectedEmpresa[prop])
                delete altEmpresa[prop]
        }
        //Prepara o objeto e envia o request
        const shouldUpdate = Object.keys(altEmpresa).length > 0
        if (shouldUpdate) {
            const requestObj = {
                id: codigoEmpresa,
                table: 'empresas',
                tablePK: 'codigo_empresa',
                updates: humps.decamelizeKeys(altEmpresa)
            }
            return requestObj
        }
    }

    const createLog = ({ demand, altContrato, approved, socioUpdates }) => {
        const
            { selectedEmpresa, info, altContratoDoc, numeroAlteracao } = state,
            { codigoEmpresa } = selectedEmpresa

        if (!demand) {
            const log = {
                history: {
                    altContrato,
                    info,
                    socioUpdates
                },
                empresaId: codigoEmpresa,
                historyLength: 0,
                approved
            }
            if (approved === false)
                log.declined = true

            if (altContratoDoc) {
                log.history.files = altContratoDoc
                log.metadata = {
                    fieldName: 'altContratoDoc',
                    empresaId: codigoEmpresa,
                    numeroAlteracao
                }
            }
            return log
        }
    }

    //Prepara os objetos para o request
    const createRequestObj = form => {

        const { selectedEmpresa } = state
        let returnObj = { codigoEmpresa: selectedEmpresa?.codigoEmpresa }

        form.forEach(({ field }) => {
            for (let prop in state) {
                if (prop === field && state[prop])
                    Object.assign(returnObj, { [prop]: state[prop] })
            }
        })

        if (Object.keys(returnObj).length > 1)
            return returnObj
        else
            return null
    }

    const handleFiles = files => {
        //limit file Size
        if (sizeExceedsLimit(files)) return

        if (files && files[0]) {
            const altContratoDoc = new FormData()
            altContratoDoc.append('altContratoDoc', files[0])
            setState({ ...state, altContratoDoc, fileToRemove: null })
        }
    }

    const removeFile = async (name) => {
        const
            { altContratoDoc } = state,
            newState = globalRemoveFile(name, altContratoDoc)

        setState({ ...state, ...newState })
    }

    const resetState = () => {

        const resetForms = {},
            forms = [altContratoForm, sociosForm]



        forms.forEach(form => {
            form.forEach(({ field }) => {
                Object.assign(resetForms, { [field]: '' })
            })
        })
        console.log(resetForms)

        setState({

            ...state, ...resetForms, activeStep: 0, razaoSocial: '', selectedEmpresa: undefined, filteredSocios: [],
            altContratoDoc: undefined, fileToRemove: undefined
        })
    }
    const
        toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg }),
        setShowPendencias = () => setState({ ...state, showPendencias: !state.showPendencias }),
        { filteredSocios, confirmToast, toastMsg } = state

    return (
        <>
            <AltContratoTemplate
                empresas={empresas}
                data={state}
                setActiveStep={setActiveStep}
                handleInput={handleInput}
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
        </>
    )
}
const collections = ['empresas', 'socios']
export default (StoreHOC(collections, AltContrato))