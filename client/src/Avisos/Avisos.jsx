import React, { useEffect, useState, useCallback } from 'react'
import StoreHOC from '../Store/StoreHOC'
import axios from 'axios'
import { bindActionCreators } from 'redux'
import { updateData, deleteOne } from '../Store/dataActions'
import { connect } from 'react-redux'
import AvisosTemplate from './AvisosTemplate'
import removePDF from '../Utils/removePDFButton'
import ConfirmDialog from '../Reusable Components/ConfirmDialog'
import NewAviso from './NewAviso'

const Avisos = props => {
    const
        originalAvisos = props.redux.avisos
        , remetentePadrao = props.redux.parametros[0]?.nomes?.siglaSistema
        , { name, role: userRole, messagesRead } = props?.user
        , [state, setState] = useState({
            unreadOnly: false,
            showAviso: false,
            writeNewAviso: false,
            rowsSelected: false,
            from: name,

        })


    //Adiciona tecla de atalho ('Esc') para fechar o aviso
    const escFunction = useCallback(e => {
        if (e.key === 'Escape')
            setState({ ...state, showAviso: false })
    }, [state])

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false)
        removePDF()
        return () => document.removeEventListener('keydown', escFunction, false)
    }, [escFunction])

    //Atualiza a prop allAreUnread do state para a correta renderização e modificação do status de múltiplas mensagens (read: true ou false)
    useEffect(() => {
        let avisos = [...originalAvisos]
            .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)) //ordena por mais recente primeiro
        for (let a of avisos) {
            if (Array.isArray(messagesRead) && messagesRead.includes(a.id))
                a.read = true
            else
                a.read = false
        }

        const
            allAreUnread = avisos.every(a => a.read === false)
            , unreadOnly = state.unreadOnly

        if (allAreUnread)
            setState(s => ({ ...s, allAreUnread: true }))

        if (unreadOnly)
            avisos = avisos.filter(a => a.read === false)

        setState(s => ({ ...s, avisos }))
    }, [props.redux.avisos, state.unreadOnly, messagesRead])


    //Abre o aviso
    const openAviso = (event, rowData) => {
        const
            index = rowData?.tableData?.id
            , aviso = state.avisos[index]

        toggleReadMessage(rowData)
        if (aviso.from === remetentePadrao || !aviso.from)
            aviso.message = JSON.parse(aviso.message)
        setState({ ...state, aviso, showAviso: true })
    }

    //Marca todos os avisos como lidos ou não lidos
    const toggleReadMessage = (data) => {
        //Se for selecionado apenas um aviso, o arg é objeto, transformar em array
        if (data instanceof Array === false)
            data = [data]

        const
            updatedAvisos = [...state.avisos]
            , allAreUnread = data.every(aviso => aviso.read === false)
            , ids = data.map(d => d.id)

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

        const
            { _id, cpf } = props.user
            , messagesRead = updatedAvisos
                .filter(a => a.read === true)
                .map(a => a.id)

        axios.patch(`/api/avisos/changeReadStatus`, { id: _id, cpf, messagesRead })
            .catch(err => {
                alert(err?.message)
                throw new Error(err)
            })


        /*const update = { ids, read: updatedReadStatus }        
         axios.patch(`/api/avisos/changeReadStatus`, update)
            .catch(err => {
                alert(err?.message)
                throw new Error(err)
            }) */
        props.updateData(updatedAvisos, 'avisos', 'id')
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
        const ids = state.idsToDelete

        axios.delete(`/api/avisos/`, { data: ids })
            .then(r => console.log(r))
            .catch(err => console.log(err))

        for (let id of ids) {
            props.deleteOne(id, 'id', 'avisos')
        }
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
        const
            { to, subject, avisoText } = state
            , vocativo = to
            , { user } = props
        let from
        if (user.role === 'admin')
            from = 'Administrador do sistema'
        if (user.role === 'tecnico')
            from = 'Equipe técnica'

        const requestObject = { from, to, vocativo, subject, message: avisoText }
        axios.post('/alerts/userAlerts/?type=saveAlert', requestObject)
            .then(r => console.log(r))
            .catch(err => console.log(err))
    }

    const
        showUnreadOnly = () => setState({ ...state, unreadOnly: !state.unreadOnly })
        , toggleAviso = () => setState({ ...state, showAviso: !state.showAviso })
        , closeConfirmDialog = () => setState({ ...state, openConfirmDialog: false })
        , toggleNewAviso = () => setState({ ...state, writeNewAviso: !state.writeNewAviso })


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
    return bindActionCreators({ updateData, deleteOne }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreHOC(collections, Avisos))
