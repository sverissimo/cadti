import React, { useEffect, useState, useCallback } from 'react'
import StoreHOC from '../Store/StoreHOC'
import AvisosTemplate from './AvisosTemplate'
import removePDF from '../Utils/removePDFButton'
import axios from 'axios'
import { bindActionCreators } from 'redux'
import { updateData, deleteOne } from '../Store/dataActions'
import { connect } from 'react-redux'


const Avisos = props => {
    const
        { avisos } = props.redux
        , [state, setState] = useState({
            showAviso: false
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

    //Abre o aviso
    const openAviso = (event, rowData) => {
        const
            index = rowData?.tableData?.id
            , aviso = avisos[index]

        toggleReadMessage(event, rowData, true)

        aviso.message = JSON.parse(aviso.message)
        setState({ ...state, aviso, showAviso: true })
    }

    //Alterna o status do aviso (read: true / false)
    const toggleReadMessage = (event, rowData, read) => {
        const
            index = rowData?.tableData?.id
            , aviso = avisos[index]
            , { id } = aviso

        //Se não for passado o parâmetro read, considerar o inverso da prop read atual
        if (read)
            aviso.read = read
        else
            aviso.read = !aviso.read

        props.updateData([aviso], 'avisos', 'id')

        axios.patch(`/api/avisos/changeReadStatus?id=${id}&read=${aviso.read}`)
            .then(r => console.log(r))
    }

    const deleteAviso = id => {

        console.log("🚀 ~ file: Avisos.jsx ~ line 64 ~ id", id)
        /* axios.delete(`/api/avisos/${id}`)
            .then(r => console.log(r))
            .catch(err => console.log(err)) */
        props.deleteOne(id, 'id', 'avisos')
    }

    const formatDataToExport = data => {
        data instanceof Array &&
            data.forEach(obj => delete obj.message)
        return data
    }

    const toggleAviso = () => setState({ ...state, showAviso: !state.showAviso })

    return (
        <AvisosTemplate
            avisos={avisos}
            data={state}
            formatDataToExport={formatDataToExport}
            openAviso={openAviso}
            toggleReadMessage={toggleReadMessage}
            close={toggleAviso}
            deleteAviso={deleteAviso}
        />
    )
}

const collections = ['avisos']
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
