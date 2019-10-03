import React, { Fragment, useState } from 'react'
import { Grid, Paper, Typography, MenuItem, Checkbox, FormControlLabel, Button } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { vehicleForm } from '../Forms/vehicleForm'
import { cadForm } from '../Forms/cadForm'
import AutoComplete from '../Utils/autoComplete'
import AddEquipa from './AddEquipa'
import PopUp from '../Utils/PopUp'

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

export default function ({ handleInput, handleBlur, data, handleEquipa, handleCheck }) {
    const { tab, empresas, razaoSocial, activeStep, equipamentos, addEquipa,
        delegatarioCompartilhado, subtitle } = data,
        classes = useStyles(), { paper, container, title } = classes

    const [shared, setShared] = useState(false)
    
    let form = []
    if (tab !== 0) form = vehicleForm[tab]
    else form = cadForm[activeStep]

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

        >
            <Grid>
                <Paper className={paper} style={{ padding: '0 2% 0 2%' }}>
                    <Grid container justify="center">
                        <Grid item xs={shared ? 4 : 12} style={{ marginBottom: '15px' }}>
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
                        {
                            shared && <Grid item xs={4}>

                                <Typography className={title}> Empresa autorizada a compartilhar</Typography>

                                <TextField
                                    inputProps={{
                                        list: 'razaoSocial',
                                        name: 'delegatarioCompartilhado',
                                    }}
                                    className={classes.textField}
                                    value={delegatarioCompartilhado}
                                    onChange={handleInput}
                                    onBlur={handleBlur}
                                />
                                <AutoComplete
                                    collection={empresas}
                                    datalist='razaoSocial'
                                    value={delegatarioCompartilhado}
                                />
                            </Grid>
                        }
                    </Grid>

                    {
                        tab === 0 && <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={shared === true}
                                        onChange={() => setShared(!shared)}
                                        value={shared}
                                    />
                                }
                                label={
                                    <Typography style={{ color: '#2979ff', fontSize: '0.7rem', float: 'right' }}>
                                        Veículo Compartilhado?
                                    </Typography>
                                }
                            />
                        </Grid>
                    }

                </Paper>
                <Grid item xs={12}>
                    <Paper className={paper}>
                        <Typography className={title}> {subtitle[tab]}</Typography>

                        {data.form && form[0] && form.map((el, i) =>
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
                                    InputLabelProps={{
                                        className: classes.textField,
                                        shrink: el.type === 'date' || undefined,
                                        style: { fontSize: '0.8rem', fontWeight: 400, color: '#455a64', marginBottom: '5%' }
                                    }}
                                    inputProps={{
                                        style: { background: '#eee', textAlign: 'center', color: '#000', fontWeight: '500' },
                                        value: `${data[el.field] || ''}`,
                                        list: el.datalist || '',
                                        maxLength: el.maxLength || '',
                                        minLength: el.minLength || '',
                                        max: el.max || '',
                                    }}
                                    multiline={el.multiline || false}
                                    rows={el.rows || null}
                                    variant={el.variant || 'filled'}
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
                                />}
                            </Fragment>
                        )}
                        {activeStep === 0 && tab === 0 && <Grid container justify="center"
                        >
                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                className={classes.button}
                                onClick={handleEquipa}
                            >
                                <AddIcon />
                                Equipamentos
                            </Button>
                        </Grid>}
                        {
                            addEquipa && <PopUp close={handleEquipa} title='Equipamentos'>
                                <AddEquipa
                                    equipamentos={equipamentos}
                                    close={handleEquipa}
                                    handleCheck={handleCheck}
                                    data={data} />
                            </PopUp>
                        }
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    )
}