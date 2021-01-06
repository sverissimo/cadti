import React, { useState } from 'react'
import axios from 'axios'
import StoreHOC from '../Store/StoreHOC'
import UsersTemplate from './UsersTemplate'
import ReactToast from '../Reusable Components/ReactToast'

const Users = props => {

    const
        { users } = props.redux,
        [state, setState] = useState({ confirmToast: false })

    const addUser = user => {
        axios.post('/users/addUser', user)
            .then(r => console.log(r.data))
            .catch(err => toast(err?.response?.data || 'Erro'))
    }
    const editUsers = user => {
        axios.put('/users/editUser', user)
            .then(r => console.log(r.data))
            .catch(err => console.log(err))
    }

    const deleteUser = user => {
        const { id } = user
        axios.delete(`/users/deleteUser?id=${id}`)
            .then(r => console.log(r.data))
            .catch(err => console.log(err))
    }

    const
        { confirmToast } = state,
        toast = (toastMsg, toastStatus) => setState({ ...state, confirmToast: !confirmToast, toastMsg, toastStatus })

    return (
        <div>
            <UsersTemplate
                collection={users}
                addUser={addUser}
                editUser={editUsers}
                deleteUser={deleteUser}
            />
            <ReactToast open={confirmToast} close={toast} msg={state.toastMsg} status='warning' />
        </div>
    )
}

const collection = ['users']

export default StoreHOC(collection, Users)
