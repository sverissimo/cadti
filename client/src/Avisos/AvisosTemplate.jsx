import React from 'react'
import avisosTable from '../Forms/avisosTable'
import CustomTable from '../Reusable Components/CustomTable'
import styles from './avisos.module.scss'


const { container, tableContainer } = styles

const AvisosTemplate = props => {
    const
        { avisos } = props
        , tableHeaders = ['Destinatário', 'Assunto', 'Lida', 'Data de criação do aviso']
        , arrayOfRows = []
    let
        row = []
        , column = {}

    console.log("🚀 ~ file: AvisosTemplate.jsx ~ line 11 ~ avisos", avisos)
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

    const table = { tableHeaders, arrayOfRows }
    return (
        <>
            <header className='flex center'>
                <h3>Avisos</h3>
            </header>
            <main className={container}>
                <div className={tableContainer}>
                    <CustomTable
                        length={tableHeaders.length}
                        title='whatever'
                        table={table}
                        style={{ textAlign: 'center', padding: '8px 0' }}
                        idIndex={1}
                        clickable={true}
                        filePK='fileId'
                        docsCollection='empresaDocs'
                    />
                </div>
            </main>
        </>
    )
}

export default AvisosTemplate
