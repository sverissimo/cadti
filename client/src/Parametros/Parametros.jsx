import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'

import ParametrosTemplate from './ParametrosTemplate'
import { distancias, nomes, parametrosIdade } from '../Forms/parametrosForm'

const Parametros = props => {
    //A prop 'params' são os nomes das propriedades do objeto do estado inicial, seja o nome de uma prop do DB seja do arquivo ./defaultParams.js
    const
        [state, setState] = useState({
            options: ['Idade e prazos para baixa', 'Distância mínima entre poltronas', 'Nomenclaturas'],
            params: ['idadeBaixa', 'distanciaPoltronas', 'nomes'],
            forms: [parametrosIdade, distancias, nomes]
        })

    //Seleciona o conjunto de parâmetros p editar
    const selectOption = useCallback(e => {
        const
            { name, value } = e.target,
            { parametros } = props.redux,
            { options, forms, params } = state,
            tab = options.indexOf(value),
            form = forms[tab],
            data = parametros[0][params[tab]]

        if (data && parametros[0]?.id)
            data.id = parametros[0].id

        setState({ ...state, ...data, initState: data, [name]: value, tab, form, modified: false })
    }, [props.redux, state])

    useEffect(() => {
        const pressKeyFnc = e => {
            let event
            if (e.key === 'p') {
                event = { target: { name: 'selectedOption', value: 'Distância mínima entre poltronas' } }
                selectOption(event)
            }
            if (e.key === 'o') {
                event = { target: { name: 'selectedOption', value: 'Nomenclaturas' } }
                selectOption(event)
            }
            if (e.key === 'q') {
                event = { target: { name: 'selectedOption', value: 'Idade e prazos para baixa' } }
                selectOption(event)
            }
        }
        document.addEventListener('keypress', pressKeyFnc)
        return () => document.removeEventListener('keypress', pressKeyFnc)
    }, [selectOption])

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

        //Prepara o objeto para request
        keys.forEach(k => Object.assign(requestObj, { [k]: state[k] }))

        //Se tiver id, já houve armazenamento no MongoDB. Nesse caso envia o ID p fazer um update ao inves de Insert.
        let id
        if (initState?.id)
            id = initState.id
        console.log({ [parametro]: requestObj, id })

        axios.put('/api/parametros', { [parametro]: requestObj, id })
            .then(r => console.log(r.data))
            .catch(err => console.log(err))
        setState({ ...state, modified: false })
    }

    return (
        <>
            <ParametrosTemplate
                data={state}
                selectOption={selectOption}
                handleInput={handleInput}
                handleSubmit={handleSubmit}
            />
        </>
    )
}

const collections = ['parametros']

export default (StoreHOC(collections, Parametros))

