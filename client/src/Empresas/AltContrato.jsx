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
import AlertDialog from '../Reusable Components/AlertDialog'

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
            showPendencias: false,
            openAlertDialog: false
            //selectedEmpresa: empresas[0],
            //filteredSocios: [socios[0], socios[1]],
        })

    //ComponentDidMount para carregar demand, se houver
    useEffect(() => {
        const demand = props?.location?.state?.demand

        if (demand && demand.history[0]) {
            const
                { empresaDocs } = props.redux,
                { altContrato, socioUpdates, files } = demand?.history[0],
                selectedEmpresa = empresas.find(e => e.empresaId === demand.codigoEmpresa),
                altContratoFields = {}

            let
                filteredSocios = JSON.parse(JSON.stringify(socios.filter(s => s.codigoEmpresa === selectedEmpresa.codigoEmpresa))),
                demandFiles

            if (altContrato)
                altContratoForm.forEach(({ field }) => altContratoFields[field] = altContrato[field])

            if (socioUpdates[0]) {
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
            }
            if (files)
                demandFiles = empresaDocs.filter(d => files.includes(d.id))

            setState({ ...state, ...altContrato, ...selectedEmpresa, selectedEmpresa, demand, demandFiles, filteredSocios, activeStep: 3 })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {

        if (state.selectedEmpresa) {

            const codigoEmpresa = state.selectedEmpresa.codigoEmpresa,
                originalSocios = JSON.parse(JSON.stringify(socios.filter(s => s.codigoEmpresa === codigoEmpresa))) || []

            setState({ ...state, originalSocios })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            socios.sort((a, b) => a.nomeSocio.localeCompare(b.nomeSocio))

            //Verifica se a soma das participações passou 100%
            socios.forEach(s => {
                totalShare += Number(s.share)
            })
            if (totalShare > 100) {
                socios.pop()
                await setState({ ...state, alertType: 'overShared', openAlertDialog: true })
                return
            }

            const clearForm = {}
            sociosForm.forEach(obj => clearForm[obj.field] = '')

            await setState({ ...state, ...clearForm, filteredSocios: socios, totalShare })
            setTimeout(() => {
                console.log(state)
                document.getElementsByName('nomeSocio')[0].focus()
            }, 200);
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

    const handleSubmit = async approved => {
        const
            { demand } = state,
            altContrato = createRequestObj(altContratoForm),
            altEmpresa = createRequestObj(empresasForm),
            empresaUpdates = updateEmpresa(altEmpresa),
            socioUpdates = checkSocioUpdates(),
            log = createLog({ demand, altContrato, socioUpdates, approved })

        let
            socioIds = [],
            toastMsg = 'Solicitação de alteração contratual enviada.'

        //console.log({ socioUpdates, empresaUpdates })
        if (empresaUpdates) {
            axios.put('/api/editTableRow', empresaUpdates)
            toastMsg = 'Dados da empresa alterados com sucesso.'
        }

        if (demand && approved) {
            if (altContrato)
                axios.post('/api/altContrato', altContrato)
            if (socioUpdates) {
                const
                    { newSocios, oldSocios, deletedSocios } = socioUpdates,
                    requestInfo = {
                        table: 'socios',
                        tablePK: 'socio_id'
                    }
                //console.log(newSocios, oldSocios, deletedSocios)
                //console.log(JSON.stringify({ requestArray: oldSocios, ...requestInfo }))
                //console.log(JSON.stringify({ socios: newSocios }))

                if (newSocios[0])
                    await axios.post('/api/cadSocios', { socios: newSocios })
                        .then(async r => {
                            const ids = r?.data.map(s => s.socio_id)
                            if (ids[0])
                                socioIds = socioIds.concat(ids)
                        })
                if (oldSocios[0]) {
                    await axios.put('/api/editSocios', { requestArray: oldSocios, ...requestInfo })
                    const ids = oldSocios.map(s => s.socio_id)
                    socioIds = socioIds.concat(ids)
                    console.log(socioIds, oldSocios, ids)
                }
                if (deletedSocios[0])
                    deletedSocios.forEach(s => {
                        axios.delete(`/api/delete?table=socios&tablePK=socio_id&id=${s.socio_id}`)
                    })
                toastMsg = 'Alteração de contrato social aprovada.'
                console.log(socioIds)
            }
        }
        if (approved === false)
            toastMsg = 'Solicitação indeferida.'

        if (socioIds[0])
            log.metadata.socios = socioIds
        console.log(socioIds)
        logGenerator(log)                               //Generate the demand
            .then(r => {
                console.log(r?.data)
            })
            .catch(err => console.log(err))

        if (demand)
            setTimeout(() => {
                props.history.push('/solicitacoes')
            }, 1500);
        else
            setTimeout(() => { resetState() }, 900);
        toast(toastMsg)
    }

    const checkSocioUpdates = () => {
        const
            { originalSocios, filteredSocios, selectedEmpresa, demand } = state,
            { codigoEmpresa } = selectedEmpresa
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
            //Se o(s) sócio(s) não possuem ID, se trata de um novo sócio, assim, todo o objeto é inserido no socioUpdates
            else {
                m.codigoEmpresa = codigoEmpresa
                socioUpdates.push(m)
            }
        })
        if (!demand)
            return socioUpdates

        //Separa os sócios modificados em novos, alterados e excluídos para que cada o respectivo request seja feito
        if (socioUpdates[0]) {
            socioUpdates = humps.decamelizeKeys(socioUpdates)
            const
                newSocios = socioUpdates.filter(s => s.status === 'new'),
                oldSocios = socioUpdates.filter(s => s.status === 'modified'),
                deletedSocios = socioUpdates.filter(s => s.status === 'deleted')

            //Apaga a prop 'status' de cada sócio antes do request
            newSocios.forEach(s => delete s.status)
            oldSocios.forEach(s => delete s.status)
            deletedSocios.forEach(s => delete s.status)

            return { newSocios, oldSocios, deletedSocios }
        }
        else return null
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
        let log

        //Se não houver demanda, criar demanda/log
        if (!demand) {
            log = {
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
                { demandFiles, numeroAlteracao, numeroRegistro } = state
            log = {
                id,
                demandFiles,
                history: {},
                metadata: {
                    numeroAlteracao,
                    numeroRegistro,
                },
                approved
            }
        }
        return log
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

        const
            resetForms = {},
            forms = [altContratoForm, sociosForm]

        forms.forEach(form => {
            form.forEach(({ field }) => {
                Object.assign(resetForms, { [field]: '' })
            })
        })

        setState({

            ...state, ...resetForms, activeStep: 0, razaoSocial: '', selectedEmpresa: undefined, filteredSocios: [],
            altContratoDoc: undefined, fileToRemove: undefined
        })
    }
    const
        toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg }),
        setShowPendencias = () => setState({ ...state, showPendencias: !state.showPendencias }),
        closeAlert = () => setState({ ...state, openAlertDialog: !state.openAlertDialog }),
        { filteredSocios, confirmToast, toastMsg, openAlertDialog, alertType, customMessage, customTitle } = state

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
            {
                openAlertDialog &&
                <AlertDialog open={openAlertDialog} alertType={alertType} close={closeAlert} customMessage={customMessage} customTitle={customTitle} />
            }
        </>
    )
}
const collections = ['empresas', 'socios', 'getFiles/empresaDocs']
export default (StoreHOC(collections, AltContrato))