import React, { Fragment, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { cadForm } from '../Forms/cadForm'
import { baixaForm } from '../Forms/baixaForm'
import AutoComplete from '../Utils/autoComplete'
import AddEquipa from './AddEquipa'
import PopUp from '../Utils/PopUp'

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

export default function ({ handleInput, handleBlur, data, handleEquipa, handleCheck,
    altPlacaOption, showAltPlaca }) {
    const { tab, empresas, razaoSocial, activeStep, equipamentos, addEquipa,
        delegatarioCompartilhado, subtitle, placa, frota } = data,
        classes = useStyles(), { paper, container, title } = classes

    const [shared, setShared] = useState(false)

    let form = cadForm[activeStep]
    if (tab === 3) form = baixaForm

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
                        {activeStep === 0 ? <Grid item xs={shared ? 4 : 12} style={{ marginBottom: '15px' }}>
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
                            :
                            <div className='formTitle'>Cadastro de Veículo - {razaoSocial}</div>
                        }
                        {
                            activeStep === 0 && shared && <Grid item xs={4} style={{ marginLeft: '30px' }}>

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
                        activeStep === 0 && <Grid item xs={12}>
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
                {
                    razaoSocial && frota[0]
                        ?
                        <Grid item xs={12}>
                            {activeStep < 3 && <Paper className={paper}>
                                <Typography className='formSubtitle'> {subtitle[activeStep]}</Typography>

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
                                    </Fragment>)}

                                {activeStep === 0 && <Grid container justify="center"
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
                                {altPlacaOption && placa.match('[a-zA-Z]{3}[-]?\\d{4}') && <Grid item xs={12}>
                                    <Typography
                                        style={{ color: '#2979ff', fontWeight: 500, fontSize: '0.75rem', padding: '2% 0 1% 70%', cursor: 'pointer' }}
                                        onClick={() => showAltPlaca()}
                                    >
                                        → Clique aqui para alterar a placa para o formato Mercosul.
                                    </Typography>

                                </Grid>}
                            </Paper>}
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