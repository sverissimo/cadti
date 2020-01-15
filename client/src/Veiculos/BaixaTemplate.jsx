import React, { Fragment } from 'react'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { baixaForm } from '../Forms/baixaForm'
import AutoComplete from '../Utils/autoComplete'

import './veiculos.css'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1)
    },
    title: {
        color: '#000',
        fontWeight: 400,
        fontSize: '0.9rem',
        textAlign: 'center'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    formHolder: {
        width: 900,
    },
    input: {
        textAlign: 'center'
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(1)
    }
}));

export default function ({ handleInput, handleBlur, data }) {
    const { empresas, razaoSocial, frota } = data,
        classes = useStyles(), { paper, container, title } = classes

    let form = baixaForm

    const errorHandler = (el) => {
        const value = data.form[el.field]
        if (el.pattern && value) return data.form[el.field].match(el.pattern) === null
        else if (value > el.max || value < el.min) return true
        else return false
    }

    const helper = (el) => {
        const value = data.form[el.field]

        if (value > el.max || value < el.min) return 'Valor inválido'
        else if (value && value.match(el.pattern) === null) return '✘'
        else if (el.pattern && value && value.match(el.pattern) !== null) return '✓'
        else return undefined
    }
    
    return (
        <Grid
            container
            direction="row"
            className={container}
            justify="center"
        >
            <Grid>
                <Paper className={paper} style={{ padding: '0 2% 0 2%' }}>
                    <Grid container justify="center">
                        <Grid item xs={12} style={{ marginBottom: '15px' }}>
                            <Typography className={title}> Selecione a Viação</Typography>

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
                        </Grid>
                    </Grid>
                </Paper>
                {
                    razaoSocial && frota[0]
                        ?
                        <Grid item xs={12}>
                            <Paper className={paper}>
                                <Typography className='formSubtitle'>Informe os dados para a baixa</Typography>
                                {
                                    form.map((el, i) =>
                                        <Fragment key={i}>
                                            <TextField
                                                name={el.field}
                                                label={el.label}
                                                margin={el.margin}
                                                className={classes.textField}
                                                onChange={handleInput}
                                                onBlur={handleBlur}
                                                type={el.type || ''}
                                                error={errorHandler(el)}
                                                helperText={helper(el)}
                                                select={el.select || false}
                                                value={data[el.field] || ''}
                                                disabled={el.disabled || false}
                                                InputLabelProps={{
                                                    className: classes.textField,
                                                    shrink: el.type === 'date' || undefined,
                                                    style: { fontSize: '0.8rem', fontWeight: 400, color: '#455a64', marginBottom: '5%' }
                                                }}
                                                inputProps={{
                                                    style: { background: el.disabled && data.disable ? '#fff' : '#efefef', textAlign: 'center', color: '#000', fontWeight: '500', width: el.width || '' },
                                                    value: `${data[el.field] || ''}`,
                                                    list: el.datalist || '',
                                                    maxLength: el.maxLength || '',
                                                    minLength: el.minLength || '',
                                                    max: el.max || '',
                                                }}
                                                multiline={el.multiline || false}
                                                rows={el.rows || null}
                                                variant={el.variant || 'filled'}
                                                fullWidth={el.fullWidth || false}
                                            >
                                                {el.select === true && el.options.map((opt, i) =>
                                                    <MenuItem key={i} value={opt}>
                                                        {opt}
                                                    </MenuItem>)}
                                            </TextField>
                                            {el.autoComplete === true && <AutoComplete
                                                collection={data[el.collection]}
                                                datalist={el.datalist}
                                                value={data[el.field] || ''}
                                            />
                                            }
                                        </Fragment>)
                                }
                            </Paper>
                        </Grid>
                        :
                        <Grid container justify="center">
                            <div className={classes.formHolder}></div>
                        </Grid>
                }
            </Grid>
        </Grid>
    )
}