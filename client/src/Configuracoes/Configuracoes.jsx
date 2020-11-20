import React, { useState, useEffect } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'

import ConfiguracoesTemplate from './ConfiguracoesTemplate'
import defaultParams from './defaultParams'
import { distancias, parametrosIdade } from '../Forms/configSysForm'

const Configuracoes = props => {
    //A prop 'params' são os nomes das propriedades do objeto do estado inicial, seja o nome de uma prop do DB seja do arquivo ./defaultParams.js
    const
        [state, setState] = useState({
            options: ['Idade e prazos para baixa', 'Distância mínima entre poltronas'],
            params: ['idadeBaixa', 'distanciaPoltronas'],
            forms: [parametrosIdade, distancias]
        }),
        { parametros } = props.redux

    //ComponentDidMount - Se não tiver coleção no MongoDB, usa os padrões do arquivo configSysForm    
    useEffect(() => {
        //Salva a prop initParams para depois avaliar se houve mudança no handleInput
        if (!parametros[0])
            setState({ ...state, ...defaultParams })
        else
            setState({ ...state, ...defaultParams, ...parametros[0] })
    }, [parametros])


    document.addEventListener('keypress', e => {
        let event
        if (e.key === 'p') {
            event = { target: { name: 'selectedOption', value: 'Distância mínima entre poltronas' } }
            selectOption(event)
        }
        if (e.key === 'q') {
            event = { target: { name: 'selectedOption', value: 'Idade e prazos para baixa' } }
            selectOption(event)
        }
    })

    //Seleciona o conjunto de parâmetros p editar
    const selectOption = e => {
        const
            { name, value } = e.target,
            { options, forms, params } = state,
            tab = options.indexOf(value),
            form = forms[tab],
            data = state[params[tab]]

        if (data && parametros[0]?.id)
            data.id = parametros[0].id

        setState({ ...state, ...data, initState: data, [name]: value, tab, form, modified: false })
    }

    //Detecta se houve mudança e salva o input do usuário no state
    const handleInput = e => {
        const
            { name, value } = e.target,
            { initState } = state
        let
            modified = false,
            stateChanged,
            fieldChanged

        Object.keys(initState).forEach(k => {
            if (k !== name && state[k].toString() !== initState[k].toString())
                stateChanged = true
        })
        fieldChanged = initState[name] && initState[name].toString() !== value

        if (fieldChanged || stateChanged)
            modified = true

        setState({ ...state, [name]: value, modified })
    }

    //Salva as alterações feitas
    const handleSubmit = () => {
        const
            { tab, forms, params, initState } = state,
            form = forms[tab],
            keys = form.map(f => f.field),
            requestObj = {},
            parametro = params[tab]
        console.log("handleSubmit -> form", form)

        //Prepara o objeto para request
        keys.forEach(k => Object.assign(requestObj, { [k]: state[k] }))

        //Se tiver id, já houve armazenamento no MongoDB. Nesse caso envia o ID p fazer um update ao inves de Insert.
        let id
        if (initState?.id)
            id = initState.id

        axios.put('/api/parametros', { [parametro]: requestObj, id })
            .then(r => console.log(r))
            .catch(err => console.log(err))
        setState({ ...state, modified: false })
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
