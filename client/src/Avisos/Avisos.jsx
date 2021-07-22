import React, { useEffect, useState, useCallback } from 'react'
import StoreHOC from '../Store/StoreHOC'
import AvisosTemplate from './AvisosTemplate'
import avisosTable from '../Forms/avisosTable'

const Avisos = props => {
    const
        { avisos } = props.redux
        , [state, setState] = useState({
            showAviso: false
        })

    //Adiciona tecla de atalho ('Esc') para fechar o aviso
    const escFunction = e => {
        if (e.key === 'Escape')
            setState({ ...state, showAviso: false })
        console.log(state)
        void 0
    }
    useEffect(() => {
        document.addEventListener('keydown', escFunction, false)
        return () => document.removeEventListener('keydown', escFunction, false)
    }, [])

    //Set the tableData to render
    useEffect(() => {
        let
            arrayOfRows = []
            , row = []
            , column = {}

        avisos.forEach(av => {
            avisosTable.forEach(at => {
                if (av.hasOwnProperty([at.field])) {
                    Object.assign(column, { ...at, value: av[at.field] })
                }
                row.push(column)
                column = {}
            })
            arrayOfRows.push(row)
            row = []
        })
        const
            tableHeaders = ['Destinatário', 'Assunto', 'Lida', 'Data de criação do aviso']
            , table = { tableHeaders, arrayOfRows }
        setState({ ...state, table })

        return () => void 0
    }, [avisos])

    //Abre o aviso
    const openAviso = index => {
        const aviso = avisos[index]
        aviso.message = JSON.parse(aviso.message)
        console.log("🚀 ~ file: Avisos.jsx ~ line 55 ~ aviso", aviso)
        setState({ ...state, aviso, showAviso: true })
    }

    const toggleAviso = () => setState({ ...state, showAviso: !state.showAviso })

    return (
        <AvisosTemplate
            avisos={avisos}
            data={state}
            openAviso={openAviso}
            close={toggleAviso}
        />
    )
}

const collections = ['avisos']

export default StoreHOC(collections, Avisos)
