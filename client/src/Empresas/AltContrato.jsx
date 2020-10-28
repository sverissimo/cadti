import React, { useState } from 'react'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'
import AltContratoTemplate from './AltContratoTemplate'
import { altContratoForm } from '../Forms/altContratoForm'
import { empresasForm } from '../Forms/empresasForm'
import { logGenerator } from '../Utils/logGenerator'

const AltContrato = props => {

    const
        { empresas } = props.redux,
        [state, setState] = useState({
            razaoSocial: '',
            activeStep: 0,
            steps: ['Alterar dados da empresa', 'Informações sobre alteração do contrato social', 'Revisão'],
            subtitles: ['Utilize os campos abaixo caso deseje editar os dados da empresa',
                'Informe as alterações no contrato social e anexe uma cópia do documento.',
                'Revise os dados informados.'
            ],
            dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social ',
            demand: undefined
        })

    function setActiveStep(action) {

        let activeStep = state.activeStep
        if (action === 'next') activeStep++
        if (action === 'back') activeStep--
        if (action === 'reset') activeStep = 0
        setState({ ...state, activeStep })
    }

    function handleInput(e) {
        const { name, value } = e.target
        let selectedEmpresa = {}

        if (name === 'razaoSocial') {
            selectedEmpresa = empresas.find(e => e.razaoSocial === value) || {}
            let venc = selectedEmpresa?.vencimentoContrato

            if (venc && venc.length > 0)
                selectedEmpresa.vencimentoContrato = venc.substr(0, 10)
            console.log(venc)

            setState({ ...state, ...selectedEmpresa, [name]: value, selectedEmpresa })
        }
        else
            setState({ ...state, [name]: value })
    }



    function handleSubmit(approved) {
        const
            { demand, selectedEmpresa, info } = state,
            { codigoEmpresa } = selectedEmpresa,
            altContrato = createRequestObj(altContratoForm),
            altEmpresa = createRequestObj(empresasForm)
        approved = true

        if (!demand) {

            const log = {
                history: [altContrato, { info }],
                empresaId: codigoEmpresa
            }
            logGenerator(log).then(r => console.log(r))
        }

        if (approved) {

            //Apaga propriedades === null ou inexistentes
            for (let prop in selectedEmpresa) {
                if (altEmpresa[prop] && altEmpresa[prop] === selectedEmpresa[prop])
                    delete altEmpresa[prop]
            }

            const altContratoObject = {
                id: codigoEmpresa,
                table: 'empresas',
                tablePK: 'codigo_empresa',
                updates: humps.decamelizeKeys(altEmpresa)
            }
            console.log(JSON.stringify(altContratoObject))
        }
    }

    //Prepara os objetos para o request
    function createRequestObj(form) {

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

    return (
        <>
            <AltContratoTemplate
                empresas={empresas}
                data={state}
                setActiveStep={setActiveStep}
                handleInput={handleInput}
                handleSubmit={handleSubmit}
            />
        </>
    )
}
const collections = ['empresas']
export default (StoreHOC(collections, AltContrato))