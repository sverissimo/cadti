import React from 'react'
import { Grid, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import MaterialTable from 'material-table';
import { tables } from './tables'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(2)
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center'
    },
    input: {
        textAlign: 'center'
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(2)
    },
    button: {
        margin: theme.spacing(1),
        float: 'right',
    },

}));

export default function ({ tab, collection, showDetails, showFiles, handleEdit, del }) {
    const classes = useStyles(), { paper } = classes
        
    return (
        <Grid item xs={12}>
            <Paper className={paper}>
                <MaterialTable
                    title=" Pesquisar dados de veículos"
                    columns={tables[tab]}
                    data={collection}
                    options={{
                        filtering: true,
                        actionsColumnIndex: -1,
                        searchFieldStyle: { color: '#024' },
                        headerStyle: { backgroundColor: '#FAFAFC' }
                    }}

                    localization={{
                        body: {
                            emptyDataSourceMessage: 'Carregando...',
                            editRow: { deleteText: 'Tem certeza que deseja apagar esse registro ?' }
                        },
                        toolbar: {
                            searchTooltip: 'Procurar',
                            searchPlaceholder: 'Procurar'
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
                            hidden: tab === 0 ? false : true,
                            icon: 'file_copy_outline',
                            iconProps: { color: 'secondary' },
                            tooltip: 'Ver arquivos',
                            onClick: (event, rowData) => showFiles(rowData.veiculoId)
                        }
                    ]}
                    editable={{
                        /* onRowUpdate: (newData, oldData) =>
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    {
                                        const data = collection;
                                        const index = data.indexOf(oldData);
                                        data[index] = newData;
                                        handleEdit({ data }, () => resolve());
                                    }
                                    resolve();
                                }, 1000);
                            }), */
                        onRowDelete: async function (oldData) {

                            await del(oldData)
                            return new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    {
                                        let data = collection;
                                        const index = data.indexOf(oldData);
                                        data.splice(index, 1);
                                        handleEdit({ data }, () => resolve());
                                    }
                                    resolve();
                                }, 200);
                            })
                        }

                    }}
                />
                <div>
                </div>
            </Paper>
        </Grid>
    )
}