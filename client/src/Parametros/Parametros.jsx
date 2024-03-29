import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'
import ReactToast from '../Reusable Components/ReactToast'

import ParametrosTemplate from './ParametrosTemplate'
import { distancias, nomes, parametrosIdade, motivosBaixa, prazosAviso, adminEmails } from '../Forms/parametrosForm'
import { checkInputErrors } from '../Utils/checkInputErrors'

const Parametros = props => {
    //A prop 'params' são os nomes das propriedades do objeto do estado inicial, seja o nome de uma prop do DB seja do arquivo ./defaultParams.js
    const
        [state, setState] = useState({
            options: ['Idade e prazos para baixa', 'Distância mínima entre poltronas', 'Nomenclaturas', 'Motivos para baixa do veículo', 'Prazos para avisos automáticos do sistema', 'Validação de campos', 'Emails para notificação automática'],
            params: ['idadeBaixa', 'distanciaPoltronas', 'nomes', 'motivosBaixa', 'prazosAlerta', 'inputValidation', 'adminEmails'],
            forms: [parametrosIdade, distancias, nomes, motivosBaixa, prazosAviso, adminEmails],
        }),

        { toastMsg, toastStatus, confirmToast } = state,
        { outsider } = props

    //Quando renderizado pelo componente Config de veículos, a prop outsider é definida como true, o state é configurado para a opção Motivo da baixa
    useEffect(() => {
        if (outsider) {
            const
                { parametros } = props.redux
                , data = parametros[0]['motivosBaixa']

            if (data && typeof data === 'object' && parametros[0]?.id)
                data.id = parametros[0].id

            setState({
                ...state,
                form: motivosBaixa,
                tab: 3,
                initState: data,
                newState: data,
                selectedOption: "Motivos para baixa do veículo"
            })
        }
        return () => void 0
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [outsider])

    //Seleciona o conjunto de parâmetros p editar
    const selectOption = useCallback(e => {
        const
            { name, value } = e.target,
            { parametros } = props.redux,
            { options, forms, params } = state,
            tab = options.indexOf(value),
            form = forms[tab]

        let data = parametros[0][params[tab]]

        if (data && data instanceof Object && parametros[0]?.id)
            data.id = parametros[0].id
        // Se o parâmetro alterado for o inputValidation, é preciso criar um objeto com id para enviar como request e alterar o coleção parametros do MongoDB
        else if (typeof data === 'boolean')
            data = { id: parametros[0].id, inputValidation: data }


        //Se for singleParams, criar uma cópia da data como newState e não usar spreadOperator
        if (tab === 3 || tab === 6)
            setState({ ...state, initState: data, newState: data, [name]: value, tab, form, modified: false })
        else
            setState({ ...state, ...data, initState: data, [name]: value, tab, form, newState: undefined, modified: false })
    }, [props.redux, state])

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
        if (tab === 3 || tab === 6) {
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


    const toggleInputValidation = () => {
        const
            inputValidation = !state?.inputValidation
            , modified = inputValidation !== state.initState.inputValidation
        setState({ ...state, inputValidation, modified })
    }


    //Salva as alterações feitas
    const handleSubmit = () => {
        const
            { tab, forms, params, initState, newState, inputValidation } = state,
            { id } = initState,
            form = forms[tab],
            keys = form && form.map(f => f.field),
            parametro = params[tab]

        let requestObj = {}

        //Se o estado modificável for uma array de strings (ex: tab===3), o requestObj é uma array
        if (tab === 3 || tab === 6) {
            newState.forEach((prop, i) => {         //Tira campos vazios do request
                if (prop === '')
                    newState.splice(i, 1)
            })
            setState({ ...state, newState })
            requestObj = newState
        }
        //Para a alteração de prazos, é necessário transformar o string input em array de números antes de enviar
        else if (tab === 4) {
            for (let obj of form) {
                let prazos = state[obj.field]

                if (!Array.isArray(prazos))
                    prazos = prazos.split(',')
                prazos = prazos.map(p => Number(p))

                Object.assign(requestObj, { [obj.field]: prazos })
            }
            //validação
            const errors = checkInputErrors()
            if (errors) {
                alert(`Os prazos devem ser informados em números de dias e separados por vírgula. Favor verificar o preenchimento.`)
                return
            }
        }
        else if (tab === 5)
            requestObj = inputValidation

        else
            keys.forEach(k => Object.assign(requestObj, { [k]: state[k] }))

        axios.patch('/api/parametros', { [parametro]: requestObj, id })
            .then(r => {
                if (r.status === 200) {
                    toast(r.data)
                    setTimeout(() => {
                        if (tab === 5)
                            setState({ ...state, initState: { id, inputValidation }, modified: false })
                        else
                            setState({ ...state, initState: requestObj, modified: false })
                    }, 1200);
                }
            })
            .catch(err => console.log(err))
    }

    const toast = (toastMsg, toastStatus) => setState({ ...state, confirmToast: !state.confirmToast, toastMsg, toastStatus })

    return (
        <>
            <ParametrosTemplate
                data={state}
                selectOption={selectOption}
                plusOne={plusOne}
                removeOne={removeOne}
                handleInput={handleInput}
                handleSubmit={handleSubmit}
                outsider={props.outsider}
                toggleChecked={toggleInputValidation}
            />
            <ReactToast open={confirmToast} close={toast} msg={toastMsg} status={toastStatus} />
        </>
    )
}

const collections = ['parametros']

export default (StoreHOC(collections, Parametros))