import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../../Store/StoreHOC'
import AltContratoTemplate from './AltContratoTemplate'
import ReactToast from '../../Reusable Components/ReactToast'
import { logGenerator } from '../../Utils/logGenerator'
import { handleFiles as globalHandleFiles, removeFile as globalRemoveFile } from '../../Utils/handleFiles'
import valueParser from '../../Utils/valueParser'

import { altContratoForm, dadosEmpresaForm, altContratoFiles, empresasForm, sociosForm } from './forms'
import { toInputDate } from '../../Utils/formatValues'
import { useShareSum } from './hooks/useShareSum'
import { useAlertDialog } from './hooks/useAlertDialog'
import { useStepper } from './hooks/useStepper'
import AlertDialog from '../../Reusable Components/AlertDialog'

const stepTitles = ['Alterar dados da empresa', 'Informações sobre alteração do contrato social', 'Informações sobre sócios', 'Revisão']
const subtitles = [
    'Utilize os campos abaixo caso deseje editar os dados da empresa',
    'Informe as alterações no contrato social ou CRC e anexe uma cópia do documento',
    'Adicione ou altere sócios e suas respectivas participações.',
    'Revise os dados informados.'
]

const AltContrato = props => {
    const { empresas } = props.redux
    const socios = [...props.redux.socios]
    const [state, setState] = useState({
        stepTitles,
        subtitles,
        razaoSocial: '',
        dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social ',
        demand: undefined,
        confirmToast: false,
        filteredSocios: [],
        showPendencias: false,
    })

    const prevSelectedEmpresa = useRef(state.selectedEmpresa)
    const shareSum = useShareSum()
    const { alert, createAlert, closeAlert } = useAlertDialog()
    const { activeStep, setActiveStep } = useStepper()


    useEffect(() => {
        if (empresas && empresas.length === 1) {
            const selectedEmpresa = { ...empresas[0] }
            selectedEmpresa.vencimentoContrato = toInputDate(selectedEmpresa?.vencimentoContrato)

            setState({ ...state, ...selectedEmpresa, selectedEmpresa, filteredSocios: socios })
        }

        const demand = props?.location?.state?.demand
        if (demand && demand.history[0]) {
            const
                { empresaDocs } = props.redux,
                { altContrato, altEmpresa, socioUpdates, files } = demand?.history[0],
                selectedEmpresa = empresas.find(e => e.codigoEmpresa === demand.empresaId),
                alteredFields = []

            //Identifica campos modificados
            for (let key in selectedEmpresa) {
                if (altEmpresa && altEmpresa[key] && altEmpresa[key] !== selectedEmpresa[key])
                    alteredFields.push(key)
            }

            const
                updatedEmpresa = { ...selectedEmpresa, ...altEmpresa }
                , selectSocios = socios.filter(s => s.empresas && s.empresas[0] && s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa))

            let
                filteredSocios = JSON.parse(JSON.stringify(selectSocios)),
                demandFiles

            if (socioUpdates && socioUpdates[0]) {
                const newSocios = []

                socioUpdates.forEach(us => {
                    //Se é novo, armazena no newSocios
                    if (us.status === 'new' || us.outsider)
                        newSocios.push(us)
                    //Senão, atualiza os existentes com os campos de vieram da demanda
                    else
                        filteredSocios.forEach(fs => {
                            if (us.socioId === fs.socioId) {
                                const index = filteredSocios.findIndex(s => s.socioId === us.socioId)
                                if (index !== -1)
                                    filteredSocios[index] = us
                            }
                        })
                })

                filteredSocios = filteredSocios
                    .concat(newSocios)
                    .sort((a, b) => a.nomeSocio.localeCompare(b.nomeSocio))
            }
            if (files)
                demandFiles = empresaDocs.filter(d => files.includes(d.id))

            setState(() => ({
                ...state, ...altContrato, ...updatedEmpresa, selectedEmpresa, demand, alteredFields,
                demandFiles, filteredSocios, activeStep: 3
            }))
        }

        return () => void 0
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //Armazena uma cópia dos sócios antes de qualquer edição para avaliar se houve mudança e fazer ou não o request

    useEffect(() => {
        const { selectedEmpresa } = state
        if (selectedEmpresa) {

            const { codigoEmpresa, vencimentoContrato } = selectedEmpresa
            selectedEmpresa.vencimentoContrato = toInputDate(vencimentoContrato)

            const originalSocios = JSON.parse(JSON.stringify(socios.filter(s => s.empresas && s.empresas[0] && s.empresas.some(e => e.codigoEmpresa === codigoEmpresa))))
            const filteredSocios = socios
                .filter(s => s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa))
                .map(s => ({ ...s }))

            prevSelectedEmpresa.current = selectedEmpresa
            setState({ ...state, ...selectedEmpresa, originalSocios, selectedEmpresa, razaoSocialEdit: selectedEmpresa.razaoSocial, filteredSocios })
        }

        if (prevSelectedEmpresa.current && !state.selectedEmpresa) {
            unselectEmpresa()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.selectedEmpresa])

    useEffect(() => {
        const { inputValidation } = props.redux.parametros[0] && props.redux.parametros[0]
        const forms = [dadosEmpresaForm, altContratoForm]
        const { checkBlankInputs, checkInputErrors } = props
        const errors = checkInputErrors('sendState')
        const blankFields = checkBlankInputs(forms[activeStep], state)

        if (errors) {
            setState({ ...state, ...errors })
            return
        }
        if (blankFields) {
            setState({ ...state, ...blankFields })
            return
        }

    }, [activeStep])

    const handleBlur = e => {
        const { name, value } = e.target

        if (name === 'razaoSocialEdit') {
            setState(s => ({ ...s, razaoSocial: value }))
        }

        if (name === 'cpfSocio') {
            const errors = checkDuplicate()
            if (errors) {
                createAlert('cpfExists')
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
        //Função que reage ao input dos campos de edição dos sócios
        const
            { name } = e.target,
            { filteredSocios, selectedEmpresa } = state,
            { codigoEmpresa } = selectedEmpresa

        let { value } = e.target

        if (name === 'share')
            value = value.replace(',', '.')

        const fs = [...filteredSocios]
        let editSocio = fs.find(s => s.edit === true)

        if (!editSocio)
            return

        //Atualiza o estado de acordo com o valor de input do usuário
        const parsedValue = valueParser(name, value)
        editSocio[name] = parsedValue
        //Acrescenta o status do sócio modificado, caso não seja === "new" nem === "deleted"
        if (!editSocio.status)
            editSocio.status = 'modified'

        //Se houver atualização na participação, acha o elemento da array empresas e atualiza o valor
        if (name === 'share' && !isNaN(+value)) {
            const
                { empresas } = editSocio,
                index = empresas.findIndex(e => e.codigoEmpresa === codigoEmpresa)
            if (index !== -1)
                empresas[index] = { ...empresas[index], share: +value }
            else if (empresas[0])
                empresas.push({ codigoEmpresa, share: +value })
            else
                editSocio.empresas = [{ codigoEmpresa, share: +value }]
        }

        //const errors = checkForErrors() || {}
        setState({ ...state, filteredSocios: fs })
    }

    const checkDuplicate = () => {
        const { filteredSocios, cpfSocio } = state
        const duplicateCpf = filteredSocios.some(s => !!cpfSocio && (s.cpfSocio === cpfSocio))
        return duplicateCpf
    }

    const checkBlankInputs = () => {
        const blankInputs = sociosForm.some(({ field }) => !state[field])
        return blankInputs
    }

    const addSocio = async () => {
        const { selectedEmpresa } = state
        const { codigoEmpresa } = selectedEmpresa
        const socios = [...state.filteredSocios]
        const addedSocio = { status: 'new' }

        if (shareSum > 100) {
            createAlert('overShared')
            setState({ ...state, share: '' })
            return
        }
        sociosForm.forEach(({ field }) => {
            Object.assign(addedSocio, { [field]: state[field] })
        })

        const errors = checkBlankInputs()
        if (errors) {
            createAlert('fieldsMissing')
            return
        }

        const { data: existingSocio } = await axios.post('/api/checkSocios', { newCpfs: [addedSocio?.cpfSocio] })
        //Se já existe, informar id, empresas e
        if (existingSocio) {
            const { socio_id, empresas } = existingSocio
            const update = {
                socioId: socio_id,
                status: 'modified',
                outsider: true,
                empresas
            }
            Object.assign(addedSocio, { ...update })
        }

        if (addedSocio.share)
            addedSocio.share = +addedSocio.share

        const { share } = addedSocio
        if (addedSocio.empresas && addedSocio.empresas.length) {
            addedSocio.empresas.push({ codigoEmpresa, share })
        }
        if (!addedSocio.empresas || !addedSocio.empresas.length) {
            addedSocio.empresas = [{ codigoEmpresa, share }]
        }

        socios.push(addedSocio)
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
        const
            { demand, form, selectedEmpresa } = state,
            { codigoEmpresa } = selectedEmpresa,
            altContrato = createRequestObj(altContratoForm),
            altEmpresa = createRequestObj(empresasForm),
            socioUpdates = checkSocioUpdates(approved),
            log = createLog({ demand, altEmpresa, altContrato, socioUpdates, approved })
        let
            socioIds = [],
            toastMsg = 'Solicitação de alteração contratual enviada.'

        //Se não houver nenhuma alteração, alerta e retorna
        if (!demand && !altContrato && !altEmpresa && !form && !socioUpdates) {
            alert('Nenhuma modificação registrada!')
            return
        }

        //Ao aprovar a solicitação(demanda)
        if (demand && approved) {

            //Registra as alterações de dados da empresa
            if (demand.history[0].altEmpresa && altEmpresa)
                axios.put('/api/editElements', {
                    table: 'empresas',
                    tablePK: 'codigo_empresa',
                    update: humps.decamelizeKeys(altEmpresa)
                })

            //Registrar as alterações contratuais
            if (altContrato)
                axios.post('/api/altContrato', altContrato)

            //Atualizar os sócios: existentes, novos e a excluir
            if (socioUpdates) {
                const
                    { newSocios, oldSocios, cpfsToAdd, cpfsToRemove } = socioUpdates,
                    requestInfo = {
                        table: 'socios',
                        tablePK: 'socio_id',
                        codigoEmpresa,
                        cpfsToAdd,
                        cpfsToRemove
                    }

                //Post request dos novos sócios
                if (newSocios[0]) {
                    const socioIdPromise = await axios.post('/api/socios', { socios: newSocios, codigoEmpresa })
                    socioIds.push(socioIdPromise.data)         //A array de ids de sócios vai para a metadata dos arquivos
                }

                //Atualiza os sócios. Status 'deleted' não são apagados, apenas têm sua coluna 'empresas' atualizada.
                if (oldSocios[0]) {
                    await axios.put('/api/socios', { socios: oldSocios, ...requestInfo })
                    const ids = oldSocios.map(s => s.socio_id)
                    socioIds = socioIds.concat(ids)             //A array de ids de sócios vai para a metadata dos arquivos
                }

                if (socioIds[0]) {
                    const unchangedSociosIds = filteredSocios
                        .filter(s => s?.socioId && !socioIds.includes(s.socioId) && s?.status !== 'deleted')
                        .map(s => s.socioId)
                        , allSociosIds = socioIds.concat(unchangedSociosIds)
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

        if (demand)
            setTimeout(() => {
                props.history.push('/solicitacoes')
            }, 1500);
        else
            setTimeout(() => { resetState() }, 900);
        toast(toastMsg)
    }

    const checkSocioUpdates = approved => {
        const
            { filteredSocios, selectedEmpresa, demand } = state,
            { codigoEmpresa } = selectedEmpresa
        let
            socioUpdates = [],
            cpfsToRemove = [],
            cpfsToAdd = []

        //verifica se houve alteração em sócios existentes e as insere em oldSocios ou se há novos sócios, inseridos em newSocios
        filteredSocios.forEach(m => {
            //Apaga campos irrelevantes
            delete m.edit
            delete m.createdAt
            delete m.razaoSocial
            //Exclui campos nulos ou em branco do request
            Object.keys(m).forEach(k => {
                if (!m[k] || m[k] === '')
                    delete m[k]
            })
            //Se foi modificado, inserido ou removido, insere o objeto socio no socioUpdates
            if (m.status)
                socioUpdates.push(m)
        })

        //Separa os sócios modificados em novos, alterados e excluídos para que cada o respectivo request seja feito
        if (socioUpdates[0]) {
            //Acrescenta o codigoEmpresa na array empresas de cada sócio
            socioUpdates.forEach(s => {
                //Se o sócio ainda não tem a empresa em sua array de empresas, inserir
                if (s.empresas && s.empresas[0] && !s.empresas.some(e => e.codigoEmpresa === codigoEmpresa)) {
                    s.empresas.push({ codigoEmpresa, share: s?.share })
                    console.log(s, s.empresas)
                }
                //Se a empresa já existe, atualiza o share
                else if (s.empresas && s.empresas[0] && s.empresas.some(e => e.codigoEmpresa === codigoEmpresa)) {
                    const index = s.empresas.findIndex(e => e.codigoEmpresa === codigoEmpresa)
                    s.empresas[index].share = +s.share
                    console.log(s, s.empresas)
                }
                else if (!s.empresas || !s.empresas[0])
                    s.empresas = [{ codigoEmpresa, share: s?.share }]
                /*   //Se newSocio, incluir cpf para atualizar permissões de usuário
                  if (s.status === 'new' || s.outsider === true)
                      cpfsToAdd.push({ cpf_socio: s.cpfSocio })
                  //Se deleted, remove o código da empresa da array de empresas do sócio e grava todos os cpfs para retirar permissão de usuário
                  if (s.empresas instanceof Array && s.status === 'deleted') {
                      s.empresas = s.empresas.filter(e => e.codigoEmpresa !== codigoEmpresa)
                      cpfsToRemove.push({ cpf_socio: s.cpfSocio }) // Esse é o formato esperado no backEnd (/users/removeEmpresa.js)
                      //Se após apagada a empresa, não houver nenhuma, registra 0 como único elemento da array empresas (previne erro no posgresql)
                      if (!s.empresas[0])
                          s.empresas = []
                  } */
            })

            //Se não tiver demand, retorna socioUpdates
            if (!demand)
                return { socioUpdates, cpfsToAdd, cpfsToRemove }

            //Prepara o objeto de resposta
            if (demand && approved) {
                //Replace with map and destructuring...
                socioUpdates.forEach(s => {
                    delete s.outsider
                    delete s.razaoSocial
                    delete s.codigoEmpresa
                    delete s.originalStatus
                    //s.empresas = JSON.stringify(s.empresas)
                })
                socioUpdates = humps.decamelizeKeys(socioUpdates)
                const
                    newSocios = socioUpdates.filter(s => s.status === 'new'),
                    oldSocios = socioUpdates.filter(s => s.status === 'modified' || s.status === 'deleted')

                //Se aprovado, Apaga a prop 'status' de cada sócio antes do request
                oldSocios.forEach(s => delete s.status)
                newSocios.forEach(s => delete s.status)
                return { newSocios, oldSocios, cpfsToAdd, cpfsToRemove }
            }
        }
        else return null
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
                    ...socioUpdates
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

    //Prepara os objetos para o request
    const createRequestObj = form => {
        const
            { selectedEmpresa, demand } = state,
            { codigoEmpresa, razaoSocial } = selectedEmpresa,
            createdAt = demand && demand.createdAt

        let returnObj = { codigoEmpresa: selectedEmpresa?.codigoEmpresa }

        form.forEach(({ field }) => {
            for (let prop in state) {
                if (prop === field && state[prop])
                    Object.assign(returnObj, { [prop]: state[prop] })
            }
        })

        //Adiciona a data de solicitação (não de cadastro) no sistema, em caso de alteração do contrato é necessário verificar
        const keys = Object.keys(returnObj)

        if (keys.length > 1) {
            //Se tiver aprovando, pega o createdAt do log(demanda) e salva, para manter a data da solicitação.
            if (keys.includes('numeroAlteracao') && demand) {
                returnObj.createdAt = createdAt
                returnObj.codigoEmpresa = codigoEmpresa     //Insere codigoEmpresa para userSocket.js filtrar no backEnd
                returnObj.razaoSocial = razaoSocial         //Insere razão social para o altContratoAlert no backEnd.
            }

            //Se alterada a razão social, a alteração está salva no state
            if (state.razaoSocial)
                returnObj.razaoSocial = state.razaoSocial
            if (state.razaoSocialEdit)
                returnObj.razaoSocial = state.razaoSocialEdit
            return returnObj

        }
        //Se keys.length não for 2 ou mais, retorna null (uma prop é o codigoEmpresa, acrescentado no início da função(this))
        else
            return null
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
            ...resetForms, activeStep: 0, stepTitles, subtitles, razaoSocial: '', selectedEmpresa: undefined,
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
                setActiveStep={setActiveStep}
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
                alert.openAlertDialog &&
                <AlertDialog open={alert.openAlertDialog} close={closeAlert} customMessage={alert.customMessage} customTitle={alert.customTitle} />
            }
        </>
    )
}
const collections = ['empresas', 'socios', 'getFiles/empresaDocs']
export default (StoreHOC(collections, AltContrato))