import React, { useState } from 'react'
import StoreHOC from '../Store/StoreHOC'
import AltContratoTemplate from './AltContratoTemplate'

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
            dropDisplay: 'Clique ou arraste para anexar a cópia da alteração do contrato social'
        })

    console.log(empresas)
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

    return (
        <>
            <AltContratoTemplate
                empresas={empresas}
                data={state}
                setActiveStep={setActiveStep}
                handleInput={handleInput}
            />
        </>
    )
}
const collections = ['empresas']
export default (StoreHOC(collections, AltContrato))