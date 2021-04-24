import axios from 'axios'
import React, { useState, useEffect } from 'react'
import StoreHOC from '../Store/StoreHOC'
import EditAccountTemplate from './EditAccountTemplate'


const EditAccount = props => {

    const
        data = props.user,
        [state, setState] = useState({ initState: {}, modified: false })


    useEffect(() => {
        if (data instanceof Object)
            setState({ ...state, ...data, initState: data })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * @param {{ target: { name: any; value: any; }; }} e
     */
    function handleInput(e) {
        const
            { name, value } = e.target
            , modified = checkForChanges(name, value)

        setState({ ...state, [name]: value, modified })
    }

    const checkForChanges = (name, value, newArray) => {
        const { initState } = state
        let
            modified = false,
            stateChanged,
            fieldChanged,
            passChanged,
            changedArray

        //Se for passada uma array, compara a array com a array inicial do estado
        if (newArray)
            changedArray = initState.toString() !== newArray.toString()

        //Senão, compara cada campo input (...com props spreaded no state) com o estado inicial
        else {
            Object.keys(initState).forEach(k => {
                if (state[k] && initState[k])
                    if (k !== name && state[k].toString() !== initState[k].toString())
                        stateChanged = true
            })
            fieldChanged = initState[name] && initState[name].toString() !== value
            passChanged = name === 'password' && state[name] && value !== ''
        }
        console.log(state[name], value)
        if (fieldChanged || stateChanged || changedArray || passChanged)
            modified = true
        return modified
    }

    const handleSubmit = () => {
        const
            modified = checkForChanges(null, null, state),
            { name, cpf, email, password } = state,
            requestObj = { name, cpf, email, password }

        requestObj.id = state._id

        axios
            .put('/users/editUser', requestObj)
            .catch(err => console.log(err))
        setState({ ...state, initState: state, modified, password: undefined })

    }

    return (
        <EditAccountTemplate
            data={state}
            handleInput={handleInput}
            handleSubmit={handleSubmit}
        />
    )
}


export default StoreHOC([], EditAccount)
