import React, { useState, useEffect } from 'react'
import axios from 'axios'
import StoreHOC from '../Store/StoreHOC'
import UsersTemplate from './UsersTemplate'
import ReactToast from '../Reusable Components/ReactToast'
import removePDF from '../Utils/removePDFButton'

const Users = props => {
    const { users, socios, procuradores } = props.redux
    const [state, setState] = useState({ confirmToast: false })

    //Desabilita opção de exportar como PDF do material-table
    useEffect(() => {
        removePDF()
        return () => removePDF(true)
    }, [])

    const addUser = async user => {
        const empresas = []
        const { cpf } = user
        const socio = socios.find(s => s.cpfSocio === cpf)
        const procurador = procuradores.find(p => p.cpfProcurador === cpf)
        const socioEmpresas = socio?.empresas || []
        const procuradorEmpresas = procurador?.empresas || []

        if (socioEmpresas) empresas.push(...socioEmpresas.map(e => e.codigoEmpresa))
        if (procuradorEmpresas) empresas.push(...procuradorEmpresas)
        user.empresas = empresas

        axios.post('/api/users', user)
            .then(r => toast('Usuário cadastrado! Aguardando confirmação de e-mail.', 'success'))
            .catch(err => { console.log(err?.response?.data); toast(` Erro: ${err?.response?.data}`) })
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
            <ReactToast open={confirmToast} close={toast} msg={state.toastMsg} status={state.toastStatus || 'warning'} />
        </div>
    )
}

const collection = ['users', 'socios', 'procuradores']

export default StoreHOC(collection, Users)
