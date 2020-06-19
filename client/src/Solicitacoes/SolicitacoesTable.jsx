import React from 'react'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import MaterialTable from 'material-table';

import { solicitacoesTable } from '../Forms/solicitacoesTable'

export default function ({ tableData, title, showDetails, assessDemand, completed, showInfo }) {

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
                    exportCsv: (columns, data) => {
                        const
                            fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                            fileExtension = '.xlsx',
                            fileName = 'Solicitações'

                        const exportToXLSX = (csvData, fileName) => {
                            const ws = XLSX.utils.json_to_sheet(csvData);
                            const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
                            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                            const data = new Blob([excelBuffer], { type: fileType });
                            FileSaver.saveAs(data, fileName + fileExtension);
                        }
                        exportToXLSX(data, fileName)
                    },
                    actionsColumnIndex: -1,
                    searchFieldStyle: { color: '#024', fontSize: '14px' },
                    headerStyle: { backgroundColor: '#FAFAFC' },
                    emptyRowsWhenPaging: false,
                    pageSize: 10,
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
                        exportName: 'Salvar como arquivo do excel',
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
                    {
                        icon: !completed ? 'assignment_turned_in_outlined_icon' : 'done_icon',
                        iconProps: { color: 'action' },
                        tooltip: !completed ? 'Analisar solicitação' : 'Concluída',
                        onClick: !completed ? (event, rowData) => assessDemand(rowData['id']) : null
                    }
                ]}
            />
        </div>
    )
}