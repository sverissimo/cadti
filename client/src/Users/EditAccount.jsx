//@ts-check
import { object } from 'prop-types'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import EditAccountTemplate from './EditAccountTemplate'


const EditAccount = props => {

    const
        data = props.user,
        [state, setState] = useState({})


    useEffect(() => {
        if (data instanceof Object)
            setState({ ...state, ...data })
    }, [])
    function handleInput(e) {
        const { name, value } = e.target
        console.log("🚀 ~ file: editAccount.jsx ~ line 15 ~ handleInput ~ { name, value }", { name, value })
        setState({ ...state, [name]: value })
    }
    return (
        <EditAccountTemplate
            data={state}
            handleInput={handleInput}
        />
    )
}

function mapStateToProps(state) {
    return {
        user: state.user
    }
}


export default connect(mapStateToProps)(EditAccount)
