import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'

import ParametrosTemplate from './ParametrosTemplate'
import { distancias, nomes, parametrosIdade, motivosBaixa } from '../Forms/parametrosForm'

const Parametros = props => {
    //A prop 'params' são os nomes das propriedades do objeto do estado inicial, seja o nome de uma prop do DB seja do arquivo ./defaultParams.js
    const
        [state, setState] = useState({
            options: ['Idade e prazos para baixa', 'Distância mínima entre poltronas', 'Nomenclaturas', 'Motivos para baixa do veículo'],
            params: ['idadeBaixa', 'distanciaPoltronas', 'nomes', 'motivosBaixa'],
            forms: [parametrosIdade, distancias, nomes, motivosBaixa]
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

        //Se for singleParams, criar uma cópia da data como newState e não usar spreadOperator
        if (tab === 3)
            setState({ ...state, initState: data, newState: data, [name]: value, tab, form, modified: false })
        else
            setState({ ...state, ...data, initState: data, [name]: value, tab, form, newState: undefined, modified: false })
    }, [props.redux, state])

    useEffect(() => {
        const pressKeyFnc = e => {
            let event
            if (e.key === 'p') {
                event = { target: { name: 'selectedOption', value: 'Motivos para baixa do veículo' } }
                selectOption(event)
            }
            if (e.key === 'o') {
                /* event = { target: { name: 'selectedOption', value: 'Nomenclaturas' } }
                selectOption(event) */
                plusOne()
            }
            if (e.key === 'q') {
                event = { target: { name: 'selectedOption', value: 'Idade e prazos para baixa' } }
                selectOption(event)
            }
        }
        document.addEventListener('keypress', pressKeyFnc)
        return () => document.removeEventListener('keypress', pressKeyFnc)
    }, [selectOption])

    //Nos formulários simples (que representam array de strings), adiciona mais um campo vazio
    const plusOne = () => {
        let newState = [...state.initState]
        if (state.newState)
            newState = [...state.newState]

        newState[newState.length] = ''
        setState({ ...state, newState })
    }

    const removeOne = index => {
        const { initState, newState } = state

        let modifiedArray = [...initState]
        if (newState)
            modifiedArray = [...newState]
        modifiedArray.splice(index, 1)

        const modified = checkForChanges(null, null, modifiedArray)
        setState({ ...state, newState: modifiedArray, modified })
    }

    //Set state com input do usuário
    const handleInput = async e => {
        const
            { tab } = state,
            { name, value } = e.target

        let modified

        //Para tabs que a data é uma array de strings, o função checkForChanges recebe outros parâmetros e o estado atualizado é uma array, não props
        if (tab === 3) {
            const tempState = [...state.newState]
            tempState[name] = value

            modified = checkForChanges(null, null, tempState)
            setState({ ...state, newState: tempState, modified })
        }
        else {
            modified = checkForChanges(name, value)
            setState({ ...state, [name]: value, modified })
        }
    }

    //Detecta se houve mudança e salva o input do usuário no state
    const checkForChanges = (name, value, newArray) => {
        const { initState } = state
        let
            modified = false,
            stateChanged,
            fieldChanged,
            changedArray
        //Se for passada uma array, compara a array com a array inicial do estado
        if (newArray)
            changedArray = initState.toString() !== newArray.toString()

        //Senão, compara cada campo input (...com props spreaded no state) com o estado inicial
        else {
            Object.keys(initState).forEach(k => {
                if (k !== name && state[k].toString() !== initState[k].toString())
                    stateChanged = true
            })
            fieldChanged = initState[name] && initState[name].toString() !== value
        }
        if (fieldChanged || stateChanged || changedArray)
            modified = true
        return modified
    }

    //Salva as alterações feitas
    const handleSubmit = () => {
        const
            { tab, forms, params, initState, newState } = state,
            { id } = initState,
            form = forms[tab],
            keys = form.map(f => f.field),
            parametro = params[tab]

        let requestObj = {}
        //Se o estado modificável for uma array de strings (ex: tab===3), o requestObj é uma array
        if (tab === 3) {
            newState.forEach((prop, i) => {         //Tira campos vazios do request
                if (prop === '')
                    newState.splice(i, 1)
            })
            setState({ ...state, newState })
            requestObj = newState
        }
        else
            keys.forEach(k => Object.assign(requestObj, { [k]: state[k] }))

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
                plusOne={plusOne}
                removeOne={removeOne}
                handleInput={handleInput}
                handleSubmit={handleSubmit}
            />
        </>
    )
}

const collections = ['parametros']

export default (StoreHOC(collections, Parametros))