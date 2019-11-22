import React, { Fragment } from 'react'
import Dropzone from 'react-dropzone'
import { Grid, Paper, Typography, MenuItem, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import { sociosForm } from '../Forms/sociosForm'
import { procuradorForm } from '../Forms/procuradorForm'

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
        width: 200,
        fontSize: '0.7rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    deleteButton: {
        marginTop: theme.spacing(1)
    },
    dropBox: {
        margin: '2% 0',
    },
    dropBoxItem: {
        margin: '2% 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '60px',
        padding: '2% 1% 0 1%',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        fontWeight: 500,
        color: '#4169E1'

    },
    dropBoxItem2: {
        margin: '2% 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '60px',
        padding: '0 1% 0 1%',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        color: 'black',
        fontWeight: 400,
    }
}));

export default function ({ handleInput, handleBlur, data, addSocio, removeSocio, handleFiles }) {
    const { activeStep, stepTitles, dropDisplay } = data,
        classes = useStyles(), { paper, container, title, deleteButton, dropBox, dropBoxItem, dropBoxItem2 } = classes

    const errorHandler = (el) => {

        const value = data[el.field]

        if (el.pattern && value) {
            console.log(value.match(el.pattern) === null);
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

    let form = [],
        socios = data.socios
    if (activeStep === 1) form = sociosForm
    if (activeStep === 2) { form = procuradorForm; socios = data.procuradores }
    
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
                                </Fragment>
                            )}
                        {activeStep !== 3 && <Button color='primary' className={deleteButton} onClick={addSocio}>
                            <AddIcon /> Adicionar {activeStep === 1 ? 'sócio' : 'procurador'}
                        </Button>}
                        {
                            activeStep === 2 && <Dropzone onDrop={handleFiles}>
                                {({ getRootProps, getInputProps }) => (
                                    <Grid container justify="center" alignItems='center' className={dropBox} direction='row' {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        {
                                            dropDisplay.match('Clique ou') ?
                                                <Grid item xs={6} className={dropBoxItem}> {dropDisplay} </Grid>
                                                :
                                                <Grid item xs={6} className={dropBoxItem2}> <DescriptionOutlinedIcon />  {dropDisplay} <br /> (clique ou arraste outro arquivo para alterar)</Grid>
                                        }
                                    </Grid>
                                )}
                            </Dropzone>
                        }
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
                                        {form.map((e, i) =>
                                            <Fragment key={i + 1000}>
                                                <TextField
                                                    value={s[e.field]}
                                                    label={e.label}
                                                    className={classes.list}
                                                    variant='outlined'
                                                    disabled
                                                />
                                            </Fragment>
                                        )}
                                        <Button className={deleteButton} color='secondary' title='Remover' onClick={() => removeSocio(i)}>
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