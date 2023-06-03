import axios from 'axios'
import React, { useState, useEffect } from 'react'
import StoreHOC from '../Store/StoreHOC'
import EditAccountTemplate from './EditAccountTemplate'
import ReactToast from '../Reusable Components/ReactToast'
import { connect } from 'react-redux'
import { editUser } from '../Store/userActions'

const EditAccount = ({ user, editUser }) => {
    const initialState = { confirmToast: false }
    const [state, setState] = useState({ initState: initialState, modified: false })
    const { toastMsg, toastStatus, confirmToast } = state

    useEffect(() => {
        if (user instanceof Object)
            setState(prevState => ({ ...prevState, ...user, initState: user }))
    }, [user])

    const handleInput = ({ target: { name, value } }) => {
        const modified = checkForChanges(name, value)
        setState(prevState => ({ ...prevState, [name]: value, modified }))
    }

    const checkForChanges = (name, value, newArray) => {
        const { initState } = state
        const passChanged = name === 'password' && state[name] && value !== ''

        const changedArray = newArray && initState.toString() !== newArray.toString()
        const fieldChanged = initState[name] && initState[name].toString() !== value

        const stateChanged = Object.keys(initState).some(key =>
            state[key]
            && initState[key]
            && key !== name
            && state[key].toString() !== initState[key].toString()
        )

        return name === 'confirmPassword' ? state.modified : fieldChanged || stateChanged || changedArray || passChanged
    }

    const handleSubmit = async () => {
        const { name, cpf, email, password, confirmPassword, _id } = state
        const modified = checkForChanges(null, null, state)

        if (password !== confirmPassword) {
            showToastMessage('Senhas não conferem', 'error')
            return
        }
        try {
            const { data: message } = await axios.put('/api/users', { name, cpf, email, password, id: _id })
            showToastMessage(message)
            editUser({ name, email })
            setState(prevState => ({
                ...prevState,
                initState: state,
                modified,
                password: undefined,
                confirmPassword: undefined
            }))
        } catch (error) {
            showToastMessage(error?.message, 'error')
        }
    }

    const showToastMessage = (message, status) => {
        setState(prevState => ({ ...prevState, confirmToast: !prevState.confirmToast, toastMsg: message, toastStatus: status }))
    }

    return (
        <>
            <EditAccountTemplate
                data={state}
                handleInput={handleInput}
                handleSubmit={handleSubmit}
            />
            <ReactToast open={confirmToast} close={showToastMessage} msg={toastMsg} status={toastStatus} />
        </>
    )
}

export default connect(null, { editUser })(StoreHOC([], EditAccount))
