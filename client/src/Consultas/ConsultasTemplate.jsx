import React from 'react'
import MaterialTable from 'material-table'
import { tables } from './tables'
import exportToXlsx from './exportToXlsx'
import { setForm } from '../Utils/createFormPattern'
import { PatchedPagination } from '../Utils/patchedPagination'

export default function ({ tab, collection: originalCol, user, procuracoes, showDetails, showFiles, showCertificate, confirmDeactivate, del }) {
    const id = ['codigoEmpresa', 'socioId', 'procuradorId', 'veiculoId', 'apolice'][tab]
    const subject = ['empresas', 'sócios', 'procuradores', 'veículos', 'seguros']
    const deleteSubject = ['codigoEmpresa', 'nomeSocio', 'nomeProcurador', 'placa', 'apolice']
    const form = setForm(tab)
    const collection = originalCol.map(col => ({ ...col }))

    return (
        <div style={{ margin: '10px 0' }} className='noPrint'>
            <MaterialTable
                title={`Pesquisar dados de ${subject[tab]}`}
                columns={tables[tab]}
                data={collection}
                style={{ fontFamily: 'Segoe UI', fontSize: '14px' }}
                options={{
                    filtering: true,
                    exportFileName: subject[tab],
                    exportButton: true,
                    exportCsv: (columns, data) => {
                        exportToXlsx(subject[tab], form, data, procuracoes)
                    },
                    actionsColumnIndex: -1,
                    searchFieldStyle: { color: '#024', fontSize: '14px' },
                    headerStyle: { backgroundColor: '#FAFAFC' },
                    emptyRowsWhenPaging: false,
                    pageSize: 20,
                    rowStyle: {
                        fontSize: '0.5rem',
                    }
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
                    {
                        icon: 'info',
                        iconProps: { color: 'primary' },
                        tooltip: 'Mais informações',
                        onClick: (event, rowData) => showDetails(event, rowData)
                    },
                    {
                        icon: 'file_copy_outline',
                        iconProps: { color: 'secondary' },
                        tooltip: 'Ver arquivos',
                        onClick: (event, rowData) => showFiles(rowData[id])
                    },
                    {
                        icon: 'class_outlined',
                        iconProps: { color: 'action' },
                        tooltip: 'Emitir certificado',
                        hidden: tab !== 3,
                        onClick: (event, rowData) => showCertificate(rowData)
                    },
                    {
                        icon: 'cancel',
                        iconProps: { color: 'disabled' },
                        tooltip: 'Desativar empresa',
                        hidden: tab !== 0 || user.role === 'empresa',
                        onClick: (event, rowData) => confirmDeactivate(rowData)
                    },
                    {
                        icon: 'delete_outline',
                        iconProps: { color: 'black' },
                        tooltip: 'Delete',
                        onClick: async (event, oldData) => {
                            if (window.confirm(`Tem certeza que deseja remover ${oldData[deleteSubject[tab]]} ?`)) {
                                await del(oldData);
                            }
                        },
                        hidden: tab === 0 || user.role === 'empresa'
                    }
                ]}
                components={{
                    Pagination: PatchedPagination,
                }}
            />
        </div>
    )
}

