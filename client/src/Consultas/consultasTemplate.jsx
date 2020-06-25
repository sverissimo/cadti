import React from 'react'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import MaterialTable from 'material-table';
import { tables } from './tables'

export default function ({ tab, collection, showDetails, showFiles, showCertificate, del }) {
    
    const id = ['delegatarioId', 'socioId', 'procuradorId', 'veiculoId', 'apolice'][tab],
        subject = ['empresas', 'sócios', 'procuradores', 'veículos', 'seguros']
    if (!Array.isArray(collection)) collection = []
    return (
        <div style={{ margin: '10px 0' }} className='noPrint'>
            <MaterialTable
                title={`Pesquisar dados de ${subject[tab]}`}
                columns={tables[tab]}
                data={collection}
                style={{ fontFamily: 'Segoe UI', fontSize: '14px' }}
                options={{
                    filtering: true,
                    exportButton: true,
                    exportFileName: subject[tab],
                    exportCsv: (columns, data) => {
                        const
                            fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                            fileExtension = '.xlsx',
                            fileName = subject[tab]

                        const exportToCSV = (csvData, fileName) => {
                            const ws = XLSX.utils.json_to_sheet(csvData);
                            const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
                            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                            const data = new Blob([excelBuffer], { type: fileType });
                            FileSaver.saveAs(data, fileName + fileExtension);
                        }
                        exportToCSV(data, fileName)
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
                    }
                ]}
                editable={{
                    onRowDelete: async oldData => await del(oldData)
                }}
            />
        </div>
    )
}