import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import StoreHOC from '../Store/StoreHOC'
import { editUser } from '../Store/userActions'
import { deleteOne } from '../Store/dataActions'
import removePDF from '../Utils/removePDFButton'
import NewAviso from './NewAviso'
import AvisosTemplate from './AvisosTemplate'
import ConfirmDialog from '../Reusable Components/ConfirmDialog'
import ReactToast from '../Reusable Components/ReactToast'

const Avisos = props => {
    const originalAvisos = props.redux.avisos
    const remetentePadrao = props.redux.parametros[0]?.nomes?.siglaSistema
    const { name, role: userRole } = props?.user
    const deletedMessages = props?.user?.deletedMessages || []
    const [state, setState] = useState({
        unreadOnly: false,
        showAviso: false,
        writeNewAviso: false,
        rowsSelected: false,
        toast: false,
        from: name
    })

    //Adiciona tecla de atalho ('Esc') para fechar o aviso
    const escFunction = useCallback(e => {
        if (e.key === 'Escape') {
            if (state.showAviso) {
                setState({ ...state, showAviso: false })
                return
            }
            setState({ ...state, writeNewAviso: false })
        }
    }, [state])

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false)
        removePDF()
        return () => document.removeEventListener('keydown', escFunction, false)
    }, [escFunction])

    useEffect(() => {
        let avisos = JSON.parse(JSON.stringify(originalAvisos))
            .filter(({ id }) => !deletedMessages.includes(id))
            .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))

        const messagesRead = props?.user?.messagesRead || []
        avisos.forEach(a => a.read = messagesRead && messagesRead.includes(a.id))

        if (state.unreadOnly) {
            avisos = avisos.filter(a => a.read === false)
        }
        const allAreUnread = avisos.every(a => a.read === false)

        setState(s => ({ ...s, avisos, allAreUnread }))
    }, [props?.user?.messagesRead, state.unreadOnly, originalAvisos])

    const openAviso = (event, rowData) => {

        const
            index = rowData?.tableData?.id
            , aviso = state.avisos[index]

        if (aviso && !aviso?.read)  //ao abrir o aviso, muda o status de lido do aviso apenas se não estiver lido
            toggleReadMessage(rowData)
        if ((aviso.from === remetentePadrao || !aviso.from) && aviso.message && typeof aviso.message === 'string')
            aviso.message = JSON.parse(aviso.message)
        setState({ ...state, aviso, showAviso: true })
    }

    const toggleReadMessage = data => {
        //Se for selecionado apenas um aviso, o arg é objeto, transformar em array
        if (data instanceof Array === false)
            data = [data]

        const updatedAvisos = [...state.avisos]
        const allAreUnread = data.every(aviso => aviso.read === false)
        const ids = data.map(d => d.id)

        let updatedReadStatus

        if (allAreUnread)
            updatedReadStatus = true
        else
            updatedReadStatus = false

        if (data?.length > 1)
            setState({ ...state, allAreUnread })

        for (let a of updatedAvisos) {
            if (ids.includes(a.id))
                a.read = updatedReadStatus
        }

        const { id, cpf } = props.user
        const messagesRead = updatedAvisos
            .filter(a => a.read === true)
            .map(a => a.id)

        axios.patch(`/api/avisos/changeReadStatus`, { id, cpf, messagesRead })
            .catch(err => {
                alert(err?.message)
                throw new Error(err)
            })

        props.editUser({ ...props.user, messagesRead })
    }

    const confirmDelete = data => {
        if (data instanceof Array === false)
            data = [data]
        const ids = data.map(el => el.id)
        setState({
            ...state,
            openConfirmDialog: true,
            confirmType: 'delete',
            idsToDelete: ids
        })
    }

    const deleteAviso = () => {
        const
            { _id, id, cpf } = props.user
            , ids = state.idsToDelete
            , allDeletedMessages = [...ids, ...deletedMessages]

        //Esse método não apaga o aviso, apenas armazena o id do aviso na prop deletedMessages do usuário
        axios.patch('/api/avisos/deleteUserMessages', { id: id || _id, cpf, deletedMessages: allDeletedMessages })

        for (let id of ids) {
            props.deleteOne(id, 'id', 'avisos')
        }

        props.editUser({ ...props.user, deletedMessages: allDeletedMessages })
        setState({ ...state, openConfirmDialog: false, rowsSelected: false })
    }

    const formatDataToExport = data => {
        data instanceof Array &&
            data.forEach(obj => {
                if (obj.read === true)
                    obj.read = 'Lida'
                if (obj.read === false)
                    obj.read = "Não lida"
                delete obj.message
            })
        return data
    }

    const toggleSelect = rows => {
        if (rows.some(r => r.tableData?.checked))
            setState({ ...state, rowsSelected: true })
        else
            setState({ ...state, rowsSelected: false })
    }

    const handleChange = e => {
        if (typeof e === 'string')
            setState({ ...state, avisoText: e })
        else {
            const { name, value } = e.target
            setState({ ...state, [name]: value })
        }
    }

    const handleSubmit = () => {
        const { to, subject, avisoText } = state
        const vocativo = to
        const { user } = props
        let from
        if (user.role === 'admin')
            from = 'Administrador do sistema'
        if (user.role === 'tecnico')
            from = 'Equipe técnica'

        const requestObject = { from, to, vocativo, subject, message: avisoText }
        axios.post('/api/avisos', requestObject)
            .then(r => console.log(r))
            .catch(err => console.log(err))
        setState({ ...state, writeNewAviso: false, toast: true, subject: undefined, avisoText: undefined })

    }

    const showUnreadOnly = () => setState({ ...state, unreadOnly: !state.unreadOnly })
    const toggleAviso = () => setState({ ...state, showAviso: !state.showAviso })
    const closeConfirmDialog = () => setState({ ...state, openConfirmDialog: false })
    const toggleNewAviso = () => setState({ ...state, writeNewAviso: !state.writeNewAviso })
    const toggleToast = () => setState({ ...state, toast: !state.toast })

    return (
        <>
            <AvisosTemplate
                avisos={state.avisos}
                data={state}
                userRole={userRole}
                defaultFrom={remetentePadrao}
                formatDataToExport={formatDataToExport}
                showUnreadOnly={showUnreadOnly}
                openAviso={openAviso}
                toggleReadMessage={toggleReadMessage}
                close={toggleAviso}
                confirmDelete={confirmDelete}
                deleteAviso={deleteAviso}
                toggleSelect={toggleSelect}
                toggleNewAviso={toggleNewAviso}
            />
            {
                state.writeNewAviso && (userRole === 'admin' || userRole === 'tecnico') &&
                <NewAviso
                    empresas={props.redux.empresas}
                    data={state}
                    handleChange={handleChange}
                    toggleNewAviso={toggleNewAviso}
                    handleSubmit={handleSubmit}
                />
            }
            {
                state.openConfirmDialog &&
                <ConfirmDialog
                    open={state.openConfirmDialog}
                    close={closeConfirmDialog}
                    confirm={deleteAviso}
                    type={state.confirmType}
                    id={state.idToDelete}
                />
            }
            <ReactToast open={state.toast} close={toggleToast} msg='Aviso criado com sucesso.' />
        </>
    )
}

const collections = ['avisos', 'empresas']
function mapStateToProps(state) {
    return {
        avisos: state.data?.avisos,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ deleteOne, editUser }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreHOC(collections, Avisos))
