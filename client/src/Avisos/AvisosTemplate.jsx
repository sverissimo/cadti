import React from 'react'
import CustomTable from '../Reusable Components/CustomTable'
import Aviso from './Aviso'
import styles from './avisos.module.scss'


const { container, tableContainer } = styles

const AvisosTemplate = props => {
    const
        { data, openAviso, close } = props
        , { table, showAviso, aviso } = data

    return (
        <>
            <header className='flex center'>
                <h3>Avisos</h3>
            </header>
            <main className={container}>
                <div className={tableContainer}>
                    {table &&
                        <CustomTable
                            length={table?.tableHeaders.length}
                            title='whatever'
                            table={table}
                            style={{ textAlign: 'center', padding: '8px 0' }}
                            idIndex={1}
                            clickable={true}
                            filePK='fileId'
                            docsCollection='empresaDocs'
                            openInfo={openAviso}
                        />}
                    {showAviso &&
                        <Aviso
                            aviso={aviso}
                            close={close}
                        />
                    }
                </div>
            </main>
        </>
    )
}

export default AvisosTemplate
