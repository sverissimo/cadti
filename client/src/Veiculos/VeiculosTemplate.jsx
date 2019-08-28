import React, { Fragment } from 'react'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { vehicleForm } from '../Forms/vehicleForm'
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
    }
}));

export default function ({ tab, empresas, handleInput, razaoSocial, handleBlur, data, handleCadastro }) {
    const classes = useStyles(), { paper, container } = classes

    return (
        <Grid
            container
            direction="row"
            className={container}
        >
            <Grid>
                <Paper className={paper}>
                    <Typography> Selecione a Viação</Typography>
                    <br />
                    <TextField
                        inputProps={{
                            list: 'razaoSocial',
                            name: 'razaoSocial',
                        }}
                        className={classes.textField}
                        value={razaoSocial}
                        onChange={handleInput}
                        onBlur={handleBlur}
                    />
                    <AutoComplete
                        collection={empresas}
                        datalist='razaoSocial'
                        value={razaoSocial}
                    />
                    <br />
                </Paper>
                <Grid item xs={12}>
                    <Paper className={paper}>
                        <Typography> Preencha dos dados do veículo</Typography>

                        {vehicleForm[tab].map((el, i) =>
                            <Fragment key={i}>
                                <TextField
                                    id="standard-name"
                                    name={el.field}
                                    label={el.label}
                                    margin={el.margin}
                                    className={classes.textField}
                                    onChange={handleInput}
                                    onBlur={handleBlur}
                                    error={false}
                                    helperText=''
                                    InputLabelProps={{ className: classes.textField, shrink: true }}
                                    inputProps={{
                                        style: { textAlign: 'center', color: '#000', fontWeight: '500' },
                                        value: `${data[el.field] || ''}`,
                                        list: el.datalist || '',
                                    }}
                                    multiline={el.multiline || false}
                                    rows={el.rows || null}
                                    variant={el.variant || 'standard'}
                                />
                                {el.field === 'placa' && <AutoComplete
                                    collection={data.frota}
                                    datalist={el.datalist}
                                    value={data.placa || ''}
                                />}
                            </Fragment>
                        )}
                        <div>
                            <Button 
                            variant="contained" 
                            color="primary" 
                            className={classes.button}
                            onClick={handleCadastro()}
                            >
                                Enviar
                        </Button>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    )
}