import React from 'react'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import MaterialTable from 'material-table';
import { tables } from './tables'

const useStyles = makeStyles(theme => ({   
    paper: {
        padding: '40px',
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(2)
    }
}));

export default function ({ tab, collection, showDetails, showFiles, del }) {
    const classes = useStyles(), { paper } = classes

    const id = ['delegatarioId', 'socioId', 'procuradorId', 'veiculoId', 'apolice'][tab],
        subject = ['empresas', 'sócios', 'procuradores', 'veículos', 'seguros']
    if (!Array.isArray(collection)) collection = []
    return (
        <Grid item xs={12}>
            <Paper className={paper}>
                <MaterialTable
                    title={`Pesquisar dados de ${subject[tab]}`}
                    columns={tables[tab]}
                    data={collection}
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
                        searchFieldStyle: { color: '#024' },
                        headerStyle: { backgroundColor: '#FAFAFC', height: '5px', maxHeight: '8px' },
                        emptyRowsWhenPaging: false,
                        pageSize: 10,
                    }}

                    localization={{
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
                            lastTooltip: 'Última Página'
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
                        }
                    ]}
                    editable={{
                        onRowDelete: async oldData => await del(oldData)
                    }}
                />
                <div>
                </div>
            </Paper>
        </Grid>
    )
}