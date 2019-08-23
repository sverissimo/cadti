import React from 'react'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import MaterialTable from 'material-table';
import TextField from '@material-ui/core/TextField'
import { vehicleTable } from './tables'
import AutoComplete from '../Utils/autoComplete'

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

export default function ({ tab, empresas, handleInput, razaoSocial, handleBlur, veiculos }) {
    const classes = useStyles(), { paper, container } = classes

    return (
        <Grid
            container
            direction="row"
            className={container}
        >
            <Grid>

                <Grid item xs={12}>
                    <Paper className={paper}>
                        <MaterialTable
                            title=" Pesquisar dados de veículos"
                            columns={vehicleTable}
                            data={veiculos}
                            options={{
                                filtering: true
                            }}
                            localization={{
                                body: {
                                    emptyDataSourceMessage: 'Carregando...'
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
                        />
                        <div>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    )
}