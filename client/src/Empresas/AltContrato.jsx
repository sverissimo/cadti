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

    //ComponentDidMount para carregar demand, se houver e selecionar a empresa dependendo do usuário
    useEffect(() => {
        if (empresas && empresas.length === 1)
            setState({ ...state, ...empresas[0], selectedEmpresa: empresas[0], filteredSocios: socios })

        const demand = props?.location?.state?.demand

        if (demand && demand.history[0]) {
            const
                { empresaDocs } = props.redux,
                { altContrato, socioUpdates, files } = demand?.history[0],
                selectedEmpresa = empresas.find(e => e.codigoEmpresa === demand.empresaId),
                altContratoFields = {}

            let
                filteredSocios = JSON.parse(JSON.stringify(socios.filter(s => s.empresas[0] && s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa)))),
                demandFiles

            if (altContrato)
                altContratoForm.forEach(({ field }) => altContratoFields[field] = altContrato[field])

            if (socioUpdates[0]) {
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

            setState({ ...state, ...altContrato, ...selectedEmpresa, selectedEmpresa, demand, demandFiles, filteredSocios, activeStep: 2 })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //Armazena uma cópia dos sócios antes de qualquer edição para avaliar se houve mudança e fazer ou não o request
    useEffect(() => {
        if (state.selectedEmpresa) {
            const
                codigoEmpresa = state.selectedEmpresa.codigoEmpresa,
                originalSocios = JSON.parse(JSON.stringify(socios.filter(s => s.empresas.some(e => e.codigoEmpresa === codigoEmpresa)))) || []

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
    }

    const handleBlur = e => {
        const
            { name, value } = e.target,
            { filteredSocios } = state

        if (name !== 'cpfSocio')
            return

        const duplicate = filteredSocios.some(s => s.cpfSocio === value)

        if (duplicate)
            setState(
                {
                    ...state,
                    openAlertDialog: true,
                    customTitle: 'Cpf já cadastrado',
                    customMessage: 'O cpf informado corresponde a um sócio já cadastrado. Para remover ou editar os dados do sócio, utilize as opções abaixo.',
                    cpfSocio: ''
                })
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

            if (selectedEmpresa?.codigoEmpresa) {

                filteredSocios = JSON.parse(JSON.stringify(socios.filter(s => s.empresas[0] && s.empresas.some(e => e.codigoEmpresa === selectedEmpresa.codigoEmpresa))))
                let aditionalSocios = JSON.parse(JSON.stringify(socios.filter(s => {
                    if (s.empresas && s.empresas[0])
                        return s.empresas.includes(selectedEmpresa.codigoEmpresa)
                })))

                aditionalSocios = filteredSocios.concat(aditionalSocios)
                const result = new Map()
                for (const s of aditionalSocios) {
                    result.set(s.socioId, s)
                }
                filteredSocios = [...result.values()]
                filteredSocios.forEach(s => {
                    let empresa
                    if (s.empresas[0])
                        empresa = s.empresas.find(e => e.share && e.codigoEmpresa === selectedEmpresa.codigoEmpresa)
                    if (empresa && empresa.share)
                        s.share = empresa.share
                })
            }

            setState({ ...state, ...selectedEmpresa, selectedEmpresa, filteredSocios, [name]: value })
        }
        else {
            const parsedValue = valueParser(name, value)
            setState({ ...state, [name]: parsedValue })
        }
    }

    const enableEdit = index => {

        let editSocio = state.filteredSocios
        if (editSocio[index].edit === true)
            editSocio[index].edit = false
        else {
            editSocio.forEach(s => s.edit = false)
            editSocio[index].edit = true
        }
        setState({ ...state, filteredSocios: editSocio })
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

        let editSocio = filteredSocios.find(s => s.edit === true)
        const index = filteredSocios.indexOf(editSocio)

        //Atualiza o estado de acordo com o valor de input do usuário
        editSocio[name] = value
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

        const fs = filteredSocios
        fs[index] = editSocio

        setState({ ...state, filteredSocios: fs })
    }

    const addSocio = async () => {
        const
            { selectedEmpresa } = state,
            { codigoEmpresa } = selectedEmpresa
        let
            socios = state.filteredSocios,
            sObject = {},
            invalid = 0,
            totalShare = 0

        //Confere se todos os campos de novos sócios foram preenchidos
        sociosForm.forEach(obj => {
            if (state[obj.field] === '' || state[obj.field] === undefined) {
                invalid += 1
            }
        })
        if (invalid === 100) {
            setState({ ...state, alertType: 'fieldsMissing', openAlertDialog: true })
            return
        }

        sociosForm.forEach(obj => {
            Object.assign(sObject, { [obj.field]: state[obj.field] })
        })
        //Verifica se o sócio já existe
        const
            checkSocios = await axios.post('/api/checkSocios', { newCpfs: [sObject?.cpfSocio] }),
            existingSocios = checkSocios?.data

        sObject.status = 'new'
        //Se já existe, informar id, empresas e 
        if (existingSocios[0]) {
            const
                { socio_id, empresas } = existingSocios[0],
                update = {
                    socioId: socio_id,
                    status: 'modified',
                    outsider: true,
                    empresas
                }

            Object.assign(sObject, { ...update })
        }
        if (sObject.share)
            sObject.share = +sObject.share

        //Insere informações sobre empresa e participação para os sócios
        const { share } = sObject
        if (sObject.empresas && sObject.empresas[0])
            sObject.empresas.push({ codigoEmpresa, share })
        if ((sObject.empresas && !sObject.empresas[0]) || !sObject.empresas)
            sObject.empresas = [{ codigoEmpresa, share }]

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
            //console.log(state)
            document.getElementsByName('nomeSocio')[0].focus()
        }, 200);

    }

    const removeSocio = index => {
        const
            { filteredSocios, selectedEmpresa, demand } = state,
            { codigoEmpresa } = selectedEmpresa,
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
            else if (socioToRemove?.status === 'deleted') {
                let { empresas, share } = socioToRemove
                const updateEmpresas = { codigoEmpresa, share: !isNaN(+share) && +share }

                if (empresas && empresas[0])
                    empresas.push(updateEmpresas)
                else
                    empresas = [updateEmpresas]

                socioToRemove.status = socioToRemove?.originalStatus
            }
            else
                socioToRemove.status = 'deleted'

            setState({ ...state, filteredSocios })
        }
    }

    const handleSubmit = async approved => {
        const
            { demand, altContratoDoc, selectedEmpresa } = state,
            { codigoEmpresa } = selectedEmpresa,
            altContrato = createRequestObj(altContratoForm),
            altEmpresa = createRequestObj(empresasForm),
            empresaUpdates = updateEmpresa(altEmpresa),
            socioUpdates = checkSocioUpdates(approved),
            log = createLog({ demand, altContrato, socioUpdates, approved })
        let
            socioIds = [],
            toastMsg = 'Solicitação de alteração contratual enviada.'

        //Se não houver nenhuma altreração, alerta e retorna
        if (!demand && !altContrato && !empresaUpdates && !altContratoDoc && !socioUpdates) {
            alert('Nenhuma modificação registrada!')
            return
        }
        //console.log(socioUpdates)

        //A alteração de dados da empresa não precisa de aprovação. Se for só isso, não gera demanda
        if (empresaUpdates) {
            axios.put('/api/editTableRow', empresaUpdates)
            toastMsg = 'Dados da empresa alterados com sucesso.'
            if (!socioUpdates[0] && !altContrato && !altContratoDoc) {
                toast('Dados da empresa atualizados!')
                setTimeout(() => { resetState() }, 750);
                return
            }
        }
        //Ao aprovar a solicitação(demanda)
        if (demand && approved) {
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
                console.log("🚀 ~ file: AltContrato.jsx ~ line 306 ~ newSocios, oldSocios", newSocios, oldSocios)

                //Post request dos novos sócios
                if (newSocios[0])
                    await axios.post('/api/cadSocios', { socios: newSocios })
                        .then(async r => {
                            const ids = r?.data.map(s => s.socio_id)
                            if (ids[0])
                                socioIds = socioIds.concat(ids)         //A array de ids de sócios vai para a metadata dos arquivos
                        })
                //Update/delete dos modificados
                if (oldSocios[0]) {
                    await axios.put('/api/editSocios', { requestArray: oldSocios, ...requestInfo })
                    const ids = oldSocios.map(s => s.socio_id)
                    socioIds = socioIds.concat(ids)             //A array de ids de sócios vai para a metadata dos arquivos
                }
                toastMsg = 'Alteração de contrato social aprovada.'
            }
        }
        if (approved === false)
            toastMsg = 'Solicitação indeferida.'

        if (socioIds[0])
            log.metadata.socios = socioIds

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

    const checkSocioUpdates = (approved) => {
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
                if (s.empresas && s.empresas[0] && !s.empresas.some(e => e.codigoEmpresa === codigoEmpresa))
                    s.empresas.push({ codigoEmpresa, share: s?.share })
                //Se a empresa já existe, atualiza o share
                else if (s.empresas && s.empresas[0] && s.empresas.some(e => e.codigoEmpresa === codigoEmpresa)) {
                    const index = s.empresas.findIndex(e => e.codigoEmpresa === codigoEmpresa)
                    s.empresas[index].share = +s.share
                }
                else if (!s.empresas || !s.empresas[0])
                    s.empresas = [{ codigoEmpresa, share: s?.share }]
                //Se newSocio, incluir cpf para atualizar permissões de usuário
                if (s.status === 'new' || s.outsider === true)
                    cpfsToAdd.push({ cpf_socio: s.cpfSocio })
                //Se deleted, remove o código da empresa da array de empresas do sócio e grava todos os cpfs para retirar permissão de usuário
                if (s.empresas instanceof Array && s.status === 'deleted') {
                    s.empresas = s.empresas.filter(e => e.codigoEmpresa !== codigoEmpresa)
                    cpfsToRemove.push({ cpf_socio: s.cpfSocio }) // Esse é o formato esperado no backEnd (/users/removeEmpresa.js)
                    //Se após apagada a empresa, não houver nenhuma, registra 0 como único elemento da array empresas (previne erro no posgresql)
                    if (!s.empresas[0])
                        s.empresas = []
                }
            })

            //Se não tiver demand, retorna socioUpdates
            if (!demand)
                return { socioUpdates, cpfsToAdd, cpfsToRemove }

            //Prepara o objeto de resposta
            if (demand && approved) {
                socioUpdates.forEach(s => {
                    delete s.outsider
                    delete s.razaoSocial
                    delete s.share
                    delete s.codigoEmpresa
                    delete s.originalStatus
                    s.empresas = JSON.stringify(s.empresas)
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
                    ...socioUpdates
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

        let clearedState = {}

        forms.forEach(form => {
            form.forEach(({ field }) => {
                Object.assign(resetForms, { [field]: '' })
            })
        })

        //Se for só uma empresa, volta para o estado inicial (componentDidMount) para procuradores de apenas uma empresa
        if (empresas && empresas.length === 1)
            clearedState = { ...state, ...empresas[0], selectedEmpresa: empresas[0], filteredSocios: socios }

        setState({
            ...state, ...resetForms, activeStep: 0, razaoSocial: '', selectedEmpresa: undefined, filteredSocios: [],
            altContratoDoc: undefined, fileToRemove: undefined, ...clearedState
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
                openAlertDialog &&
                <AlertDialog open={openAlertDialog} alertType={alertType} close={closeAlert} customMessage={customMessage} customTitle={customTitle} />
            }
        </>
    )
}
const collections = ['empresas', 'socios', 'getFiles/empresaDocs']
export default (StoreHOC(collections, AltContrato))