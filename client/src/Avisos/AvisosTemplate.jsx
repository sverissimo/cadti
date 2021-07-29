import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import MaterialTable from 'material-table'
import React from 'react'
import exportToXlsx from '../Consultas/exportToXlsx'
import Aviso from './Aviso'
import styles from './avisos.module.scss'
import avisosTable from './avisosTable'


const { container, tableContainer } = styles

const AvisosTemplate = props => {
    const
        { data, avisos, openAviso, toggleReadMessage, close, formatDataToExport, confirmDelete } = props
        , { showAviso, aviso } = data

    return (
        <>
            <main className={container}>
                <div className={tableContainer}>
                    <MaterialTable
                        title={`Avisos`}
                        columns={avisosTable}
                        data={avisos}
                        onRowClick={openAviso}
                        style={{ fontFamily: 'Segoe UI', fontSize: '14px' }}
                        icons={{
                            Delete: React.forwardRef((props, ref) => (
                                <DeleteOutlineIcon style={{ color: "red" }} {...props} ref={ref} />
                            ))
                        }}
                        options={{
                            filtering: true,
                            exportFileName: 'avisos',
                            exportButton: true,
                            exportCsv: (columns, data) => {
                                const dataToExport = formatDataToExport(data)
                                exportToXlsx('avisos', avisosTable, dataToExport)
                            },
                            rowStyle: rowData => {
                                return { fontWeight: rowData.read ? 400 : 600 }
                            },
                            actionsColumnIndex: -1,
                            searchFieldStyle: { color: '#024', fontSize: '14px' },
                            headerStyle: { backgroundColor: '#FAFAFC' },
                            emptyRowsWhenPaging: false,
                            pageSize: 20,

                        }}
                        localization={{
                            header: { actions: 'Opções' },
                            body: {
                                emptyDataSourceMessage: 'Registro não encontrado.',
                                editRow: { deleteText: 'Tem certeza que deseja apagar esse registro ?' },
                                deleteTooltip: 'Apagar',
                                filterRow: { filterTooltip: 'Filtrar' }
                            },
                            toolbar: {
                                searchTooltip: 'Procurar',
                                searchPlaceholder: 'Procurar',
                                exportCSVName: 'Salvar como arquivo do excel',
                                exportAriaLabel: 'Exportar',
                                exportTitle: 'Exportar'
                            },
                            pagination: {

                                labelRowsSelect: 'Resultados por página',
                                labelDisplayedRows: ' {from}-{to} a {count}',
                                firstTooltip: 'Primeira página',
                                previousTooltip: 'Página anterior',
                                nextTooltip: 'Próxima Página',
                                lastTooltip: 'Última Página',
                            }
                        }}
                        actions={[
                            rowData =>
                            ({
                                icon: rowData.read ? 'draftsOutlinedIcon' : 'mailOutlined',
                                iconProps: { color: rowData.read ? 'disabled' : 'primary', zindex: 10 },
                                tooltip: !rowData.read ? 'Marcar como lida' : 'Marcar como não lida',
                                onClick: toggleReadMessage
                            }),
                            {
                                icon: 'deleteOutline',
                                iconProps: { color: 'error' },
                                tooltip: 'Apagar aviso',
                                onClick: (event, rowData) => confirmDelete(rowData)
                            }
                        ]}
                    />

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

