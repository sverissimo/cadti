import React, { useState, useEffect } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'
import AltContratoTemplate from './AltContratoTemplate'
import { altContratoForm } from '../Forms/altContratoForm'
import { empresasForm } from '../Forms/empresasForm'
import { logGenerator } from '../Utils/logGenerator'
import { removeFile as globalRemoveFile, sizeExceedsLimit } from '../Utils/handleFiles'
import SociosTemplate from './SociosTemplate'
import { sociosForm } from '../Forms/sociosForm'

const AltContrato = props => {

    const
        { empresas, socios } = props.redux,
        [state, setState] = useState({
            razaoSocial: '',
            activeStep: 0,
            steps: ['Alterar dados da empresa', 'Informações sobre alteração do contrato social', 'Revisão'],
            subtitles: ['Utilize os campos abaixo caso deseje editar os dados da empresa',
                'Informe as alterações no contrato social e anexe uma cópia do documento.',
                'Revise os dados informados.'
            ],
            dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social ',
            demand: undefined,
            confirmToast: false,
            filteredSocios: []
        })

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
                filteredSocios = socios.filter(s => s.codigoEmpresa === selectedEmpresa.codigoEmpresa)

            setState({ ...state, ...selectedEmpresa, selectedEmpresa, filteredSocios, [name]: value })
        }
        else
            setState({ ...state, [name]: value })

        console.log(activeStep)

        if (activeStep === 2) {

            const { originalSocios } = state
            let socioUpdates = []

            console.log(originalSocios, state.filteredSocios)
            originalSocios.forEach(s => {
                state.filteredSocios.forEach(fs => {
                    const
                        js = JSON.stringify(s),
                        jfs = JSON.stringify(fs)

                    if (s.cpfSocio === fs.cpfSocio && js !== jfs) {
                        socioUpdates.push(fs)
                        //setState({ ...state, socioUpdates })
                        console.log(s.cpfSocio, fs.cpfSocio, socioUpdates)
                    }
                })
            })
        }
    }

    const enableEdit = index => {

        let editSocio = state.filteredSocios
        if (editSocio[index].edit === true) editSocio[index].edit = false
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
        } else {
            sociosForm.forEach(obj => {
                Object.assign(sObject, { [obj.field]: state[obj.field] })
            })
            socios.push(sObject)

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
        const filteredSocios = state.filteredSocios
        filteredSocios.splice(index, 1)
        setState({ ...state, filteredSocios })
    }

    const handleSubmit = approved => {
        const
            { demand } = state,
            altContrato = createRequestObj(altContratoForm),
            altEmpresa = createRequestObj(empresasForm)

        updateEmpresa(altEmpresa)
        //createLog({ demand, altContrato })

        if (approved) {

        }
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
            axios.put('/api/editTableRow', requestObj)
        }
    }

    const createLog = ({ demand, altContrato, approved }) => {
        const
            { selectedEmpresa, info, altContratoDoc, numeroAlteracao } = state,
            { codigoEmpresa } = selectedEmpresa

        if (!demand) {
            const log = {
                history: {
                    altContrato,
                    info
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
            logGenerator(log)                               //Generate the demand
                .then(r => {
                    console.log(r?.data)
                    toast()
                })
                .catch(err => console.log(err))
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

    const
        toast = () => setState({ ...state, confirmToast: !state.confirmToast }),
        { activeStep, filteredSocios } = state

    return (
        <>
            {
                activeStep !== 2 ?
                    <AltContratoTemplate
                        empresas={empresas}
                        data={state}
                        setActiveStep={setActiveStep}
                        handleInput={handleInput}
                        handleSubmit={handleSubmit}
                        handleFiles={handleFiles}
                        removeFile={removeFile}
                    />
                    :
                    <SociosTemplate
                        data={state}
                        socios={filteredSocios}
                        handleInput={handleInput}
                        //  handleBlur={handleBlur}
                        addSocio={addSocio}
                        removeSocio={removeSocio}
                        handleFiles={handleFiles}
                        enableEdit={enableEdit}
                        handleEdit={handleEdit}
                        noUpload={true}
                    />
            }
        </>
    )
}
const collections = ['empresas', 'socios']
export default (StoreHOC(collections, AltContrato))