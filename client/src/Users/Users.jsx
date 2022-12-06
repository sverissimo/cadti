import React, { useState, useEffect } from 'react'
import axios from 'axios'
import StoreHOC from '../Store/StoreHOC'
import UsersTemplate from './UsersTemplate'
import ReactToast from '../Reusable Components/ReactToast'
import removePDF from '../Utils/removePDFButton'

const Users = props => {

    const
        { users, socios } = props.redux,
        [state, setState] = useState({ confirmToast: false })

    //Desabilita opção de exportar como PDF do material-table
    useEffect(() => {
        removePDF()
        return () => removePDF(true)
    }, [])

    const addUser = async user => {

        const
            { cpf } = user,
            socio = socios.find(s => s.cpfSocio === cpf)

        if (socio)
            user.empresas = [socio.codigoEmpresa]

        axios.post('/api/users', user)
            .then(r => console.log(r.data))
            .catch(err => toast(' Erro!'))
    }
    const editUsers = user => {
        axios.put('/api/users', user)
            .then(r => console.log(r.data))
            .catch(err => console.log(err))
    }

    const deleteUser = user => {
        const { id } = user
        axios.delete(`/api/users?id=${id}`)
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

const collection = ['users', 'socios']

export default StoreHOC(collection, Users)
