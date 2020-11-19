import React, { useState, useEffect } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'

import ConfiguracoesTemplate from './ConfiguracoesTemplate'
import defaultParams from './defaultParams'
import { distancias, parametrosIdade } from '../Forms/configSysForm'

const Configuracoes = props => {
    const
        [state, setState] = useState({
            options: ['Idade e prazos para baixa', 'Distância mínima entre poltronas'],
            forms: [parametrosIdade, distancias],
            form: parametrosIdade
        }),
        { parametros } = props.redux

    //ComponentDidMount - Se não tiver coleção no MongoDB, usa os padrões do arquivo configSysForm
    useEffect(() => {

        console.log(props.redux)
        if (!parametros[0])
            setState({ ...state, ...defaultParams })
        else
            setState({ ...state, ...parametros[0] })
    }, [parametros])

    //Seleciona o conjunto de parâmetros p editar
    const selectOption = e => {
        const
            { name, value } = e.target,
            { options, forms } = state,
            tab = options.indexOf(value),
            form = forms[tab]

        setState({ ...state, [name]: value, tab, form })
    }
    //Salva o input do usuário no state
    const handleInput = e => {
        const { name, value } = e.target
        setState({ ...state, [name]: value })
    }
    //Salva as alterações feitas
    const handleSubmit = () => {
        const
            { tab, forms } = state,
            form = forms[tab],
            originalValues = parametros[0],
            keys = form.map(f => f.field),
            requestObj = {}

        //Somente registra no request o que foi alterado
        keys.forEach(k => {
            const shouldUpdate = !originalValues || (originalValues && originalValues[k] && originalValues[k] !== state[k])
            if (shouldUpdate)
                Object.assign(requestObj, { [k]: state[k] })
        })

        if (originalValues && originalValues?.id)
            requestObj.id = originalValues.id

        console.log(requestObj)
        axios.put('/api/parametros', requestObj)
            .then(r => console.log(r))
            .catch(err => console.log(err))
    }

    return (
        <>
            <ConfiguracoesTemplate
                data={state}
                selectOption={selectOption}
                handleInput={handleInput}
                handleSubmit={handleSubmit}
            />
        </>
    )
}

const collections = ['parametros']

export default (StoreHOC(collections, Configuracoes))
