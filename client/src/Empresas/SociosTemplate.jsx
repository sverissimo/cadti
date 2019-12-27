import React, { Fragment } from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import { sociosForm as form } from '../Forms/sociosForm'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1)
    },
    title: {
        color: '#000',
        fontWeight: 500,
        textAlign: 'center'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
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
    },
    list: {
        margin: theme.spacing(1),
        width: 180,
        fontSize: '0.7rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    iconButton: {
        marginTop: '17px',
        padding: '6px 0px'
    },
    addButton: {
        marginBottom: '1%',
        padding: '1% 0'
    }
}));

export default function ({ handleInput, handleBlur, data, addSocio, removeSocio, handleFiles, enableEdit, handleEdit }) {
    const { activeStep, stepTitles, socios } = data,
        classes = useStyles(), { paper, container, title, iconButton, list, addButton } = classes

    const errorHandler = (el) => {

        const value = data[el.field]

        if (el.pattern && value) {
            return value.match(el.pattern) === null
        }
        if (value > el.max || value < el.min) return true
        else return false
    }

    const helper = (el) => {
        const value = data[el.field]

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
                <Grid item xs={12}>
                    <Paper className={paper}>
                        <Typography className={title}> {stepTitles[activeStep]}</Typography>

                        {
                            form.map((el, i) =>
                                <Fragment key={i}>
                                    <TextField
                                        name={el.field}
                                        label={el.label}
                                        margin='normal'
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
                                            style: { fontSize: '0.75rem', fontWeight: 400, color: '#455a64', marginBottom: '5%' }
                                        }}
                                        inputProps={{
                                            style: { background: el.disabled && data.disable ? '#fff' : '#fafafa',  height: '7px' },
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
                                </Fragment>
                            )}
                        <Button color='primary' className={addButton} onClick={addSocio}>
                            <AddIcon /> Adicionar sócio
                        </Button>
                    </Paper>
                </Grid>
                {
                    socios.length > 0 && <Grid container
                        direction="row"
                        className={container}
                        justify="center"
                        alignItems="center">
                        <Grid item xs={12}>
                            <Paper className={paper}>
                                <p className={title}>{activeStep === 1 ? 'Sócios' : 'Procuradores'} cadastrados</p>
                                {socios.map((s, i) =>
                                    <Grid key={i}>
                                        {form.map((e, k) =>
                                            <Fragment key={k + 1000}>
                                                <TextField
                                                    value={s[e.field] || ''}
                                                    name={e.field}
                                                    label={e.label}
                                                    className={list}
                                                    disabled={e.field === 'cpfSocio' ? true : s.edit ? false : true}
                                                    onChange={handleEdit}
                                                    InputLabelProps={{ shrink: true, style: { fontWeight: 600 } }}
                                                />
                                            </Fragment>
                                        )}
                                        <Button component='span' className={iconButton} title='editar' onClick={() => enableEdit(i)}>
                                            <EditIcon />
                                        </Button>

                                        <Button className={iconButton} color='secondary' title='Remover' onClick={() => removeSocio(i)}>
                                            <DeleteIcon />
                                        </Button>
                                    </Grid>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                }
            </Grid>
        </Grid>
    )
}