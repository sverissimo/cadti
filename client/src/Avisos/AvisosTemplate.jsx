import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import MaterialTable, { MTableBodyRow } from 'material-table'
import React from 'react'
import exportToXlsx from '../Consultas/exportToXlsx'
import CheckBoxFilter from '../Reusable Components/CheckBoxFilter';
import CustomButton2 from '../Reusable Components/CustomButton2';
import Aviso from './Aviso'
import styles from './avisos.module.scss'
import './avisos.scss'
import avisosTable from './avisosTable'
import CustomAviso from './CustomAviso';


const { container, tableContainer, avisosHeader } = styles

const AvisosTemplate = props => {
    const
        { data, openAviso, close, formatDataToExport, toggleReadMessage, confirmDelete, toggleSelect,
            showUnreadOnly, toggleNewAviso, defaultFrom } = props
        , { avisos, showAviso, aviso, rowsSelected, allAreUnread, unreadOnly } = data

    return (
        <>
            <header className={avisosHeader}>
                <CustomButton2
                    variant="outlined"
                    iconName='add'
                    label='novo aviso'
                    className='none'
                    onClick={toggleNewAviso}
                />
                <CheckBoxFilter
                    title='Mostrar somente avisos não lidos'
                    checked={unreadOnly}
                    toggleChecked={showUnreadOnly}
                />
            </header>
            <main className={container}>
                <div className={tableContainer}>
                    <MaterialTable
                        title={`Avisos`}
                        columns={avisosTable}
                        data={avisos}
                        components={{
                            Row: props => {
                                const
                                    propsCopy = { ...props }
                                    , { data, actions } = propsCopy

                                const markAsReadAction = actions.find(a => a.name === 'markAsRead');
                                if (data.read === true) {
                                    markAsReadAction.icon = 'draftsOutlinedIcon'
                                    markAsReadAction.iconProps = { color: 'disabled', zindex: 11 }
                                }
                                else {
                                    markAsReadAction.iconProps = { color: 'primary', zindex: 11 }
                                    markAsReadAction.icon = 'mailOutlined'
                                }
                                //propsCopy.actions.find(a => a.name === 'remove').disabled = propsCopy.data.id < 100;
                                return <MTableBodyRow
                                    {...propsCopy}
                                />
                            }
                        }}
                        onRowClick={openAviso}
                        style={{ fontFamily: 'Segoe UI', fontSize: '14px' }}
                        icons={{
                            Delete: React.forwardRef((props, ref) => (
                                <DeleteOutlineIcon style={{ color: "red" }} {...props} ref={ref} />
                            ))
                        }}
                        options={{
                            filtering: true,
                            selection: true,
                            selectionProps: {},
                            search: rowsSelected ? false : true,
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
                        onSelectionChange={rows => toggleSelect(rows)}
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
                                nRowsSelected: '{0} avisos selecionados',
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
                            {
                                name: 'markAsRead',
                                icon: rowsSelected && allAreUnread ? 'draftsOutlinedIcon' : 'mailOutlined',
                                tooltip: rowsSelected && allAreUnread ? 'Marcar como lida' : 'Marcar como não lida',
                                onClick: (event, data) => toggleReadMessage(data),
                                position: rowsSelected ? 'auto' : 'row'
                                //iconProps: { color: data?.tableData?.read ? 'disabled' : 'primary' },
                                //tooltip: !rowData.read ? 'Marcar como lida' : 'Marcar como não lida',                                 
                            },
                            {
                                name: 'remove',
                                icon: 'deleteOutline',
                                iconProps: { color: 'error' },
                                tooltip: 'Apagar aviso',
                                position: rowsSelected ? 'auto' : 'row',
                                onClick: (event, rowData) => confirmDelete(rowData)
                            }
                        ]}
                    />

                    {showAviso ?
                        aviso.from === defaultFrom || !aviso.from ?
                            <Aviso
                                aviso={aviso}
                                close={close}
                            />
                            :
                            <CustomAviso
                                aviso={aviso}
                                close={close}
                            />
                        :
                        null
                    }
                </div>
            </main>
        </>
    )
}

export default AvisosTemplate

