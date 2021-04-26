import axios from 'axios'
import React, { useState, useEffect } from 'react'
import StoreHOC from '../Store/StoreHOC'
import EditAccountTemplate from './EditAccountTemplate'
import ReactToast from '../Reusable Components/ReactToast'
import { connect } from 'react-redux'
import { editUser } from '../Store/userActions'

const EditAccount = props => {

    const
        data = props.user,
        [state, setState] = useState({ initState: { confirmToast: false }, modified: false }),
        { toastMsg, toastStatus, confirmToast } = state


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

        if (name === 'confirmPassword')
            modified = state.modified
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

        if (fieldChanged || stateChanged || changedArray || passChanged)
            modified = true
        return modified
    }

    const handleSubmit = () => {
        const
            modified = checkForChanges(null, null, state),
            { name, cpf, email, password, confirmPassword } = state,
            requestObj = { name, cpf, email, password }

        if (password !== confirmPassword) {
            toast('Senhas não conferem', 'error')
            return
        }

        requestObj.id = state._id
        axios
            .put('/users/editUser', requestObj)
            .then(r => {
                if (r.status === 200) {
                    toast(r.data)
                    props.editUser({ name, email })
                    setTimeout(() => {
                        setState({
                            ...state,
                            initState: state,
                            modified,
                            password: undefined,
                            confirmPassword: undefined
                        })
                    }, 1200);
                }
            })
            .catch(err => toast(err.message, 'error'))
    }

    const toast = (toastMsg, toastStatus) => setState({ ...state, confirmToast: !state.confirmToast, toastMsg, toastStatus })

    return (
        <>
            <EditAccountTemplate
                data={state}
                handleInput={handleInput}
                handleSubmit={handleSubmit}
            />
            <ReactToast open={confirmToast} close={toast} msg={toastMsg} status={toastStatus} />
        </>
    )
}

export default connect(null, { editUser })(StoreHOC([], EditAccount))
