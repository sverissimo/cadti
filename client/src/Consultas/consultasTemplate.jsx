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

export default function ({ tab, collection, handleEdit }) {
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
                        searchFieldStyle: { color: '#00B' },
                        headerStyle: { backgroundColor: '#aaccee', color: '#FFF' }
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
                            onClick: (event, rowData) => alert("You saved " + rowData.name)
                        }
                    ]}
                    editable={{
                        onRowUpdate: (newData, oldData) =>
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
                            }),
                        onRowDelete: oldData =>
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    {
                                        let data = collection;
                                        const index = data.indexOf(oldData);
                                        data.splice(index, 1);
                                        handleEdit({ data }, () => resolve());
                                    }
                                    resolve()
                                }, 1000)
                            }),
                    }}

                />
                <div>
                </div>
            </Paper>
        </Grid>
    )
}