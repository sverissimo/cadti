import React from 'react'
import MaterialTable from 'material-table'
import exportToXlsx from '../Consultas/exportToXlsx'
import { solicitacoesTable } from '../Forms/solicitacoesTable'
import configTablePermissions from './configTablePermissions'
import { PatchedPagination } from '../Utils/patchedPagination'

export default function ({ tableData, title, showDetails, assessDemand, completed, showInfo, user }) {

    let parsedData = JSON.parse(JSON.stringify(tableData))
    parsedData.forEach(obj => delete obj.history)

    return (
        <div style={{ margin: '10px 0' }} className='noPrint'>
            <MaterialTable
                title={title}
                columns={solicitacoesTable}
                data={parsedData}
                style={{ fontFamily: 'Segoe UI', fontSize: '14px' }}
                options={{
                    filtering: true,
                    exportButton: true,
                    exportFileName: 'Solicitações',
                    exportCsv: (col, data) => exportToXlsx('Solicitações', solicitacoesTable, data),
                    actionsColumnIndex: -1,
                    searchFieldStyle: { color: '#024', fontSize: '14px' },
                    headerStyle: { backgroundColor: '#FAFAFC' },
                    emptyRowsWhenPaging: false,
                    pageSize: 10,
                }}

                localization={{
                    header: { actions: 'Opções' },
                    body: {
                        emptyDataSourceMessage: 'Nenhuma solicitação aberta no momento.',
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
                    {
                        icon: 'history_icon',
                        iconProps: { color: 'primary' },
                        tooltip: 'Ver histórico',
                        onClick: (event, rowData) => showDetails(rowData['id'])
                    },
                    rowData => (configTablePermissions({ rowData, user }) && {
                        icon: !completed ? 'assignment_turned_in_outlined' : rowData?.status === 'Solicitação indeferida' ? 'clear' : 'done_icon',
                        iconProps: {
                            className: !completed ? 'assessDemandButton' : '',
                            color: rowData?.status === 'Solicitação indeferida' ? 'secondary' : completed ? 'action' : 'disabled'
                        },
                        tooltip: rowData?.status.match('Aguardando')
                            ? 'Analisar solicitação'
                            : rowData?.status.match('Pendências')
                                ? 'Abrir solicitação'
                                : rowData?.status === 'Solicitação indeferida' ?
                                    'Indeferida'
                                    : 'Concluída',
                        onClick: (event, rowData) => !completed ? assessDemand(rowData['id']) : null
                    })
                ]}
                components={{
                    Pagination: PatchedPagination,
                }}
            />
        </div>
    )
}