import React, { Fragment } from 'react'
import Dropzone from 'react-dropzone'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { empresasForm } from '../Forms/empresasForm'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
        height: 'auto',
    },
    title: {
        color: '#000',
        fontWeight: 500,
        textAlign: 'center'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        fontColor: '#bbb',
        textAlign: 'center'
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
    dropBox: {
        margin: '2% 0',
    },
    dropBoxItem: {
        margin: '12px 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '50px',
        padding: '17px',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        fontSize: '0.75rem',
        color: '#4169E1',
        backgroundColor: '#fafafa'
    },
    dropBoxItem2: {
        margin: '12px 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '50px',
        padding: '0 1% 0 1%',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        fontSize: '0.75rem',
        color: '#00000',
        backgroundColor: '#fafafa'
    }
}));

export default function ({ handleInput, handleBlur, data, handleFiles }) {
    const { activeStep, stepTitles, dropDisplay } = data,
        classes = useStyles(), { paper, container, title, dropBox, dropBoxItem, dropBoxItem2 } = classes

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
                {
                    true
                        ?
                        <Grid item xs={12}>
                            <Paper className={paper}>
                                <Typography className={title}> {stepTitles[activeStep]}</Typography>
                                {empresasForm.map((el, i) =>
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
                                                style: { fontSize: '0.7rem', color: '#444' }
                                            }}
                                            inputProps={{
                                                style: {
                                                    background: el.disabled && data.disable ? '#fff' : '#fafafa', fontSize: '0.85rem',
                                                    color: '#000', textAlign: 'center', width: el.width || '', height: '8px'
                                                },
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
                                        </TextField>
                                    </Fragment>)}
                                <Dropzone onDrop={handleFiles}>
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
                            </Paper>
                        </Grid >
                        :
                        <Grid container justify="center">
                            <div className={classes.formHolder}></div>
                        </Grid>
                }
            </Grid>
        </Grid >
    )
}