import React, { Fragment } from 'react'

import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'
import AutoComplete from '../Utils/autoComplete'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { altForm } from '../Forms/altForm'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1)
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

export default function ({ handleInput, handleBlur, data, handleEquipa, setActiveStep,
    altPlacaOption, showAltPlaca }) {
    const { tab, razaoSocial, activeStep, subtitle, placa, justificativa } = data,
        classes = useStyles(), { paper, container } = classes

    let form = altForm[activeStep]    

    const showForm = () => {
        const check = data.empresas.filter(e => e.razaoSocial === razaoSocial)
        if (check && check[0]) {
            return true
        }
        else return false
    }

    return (
        <Fragment>
            <Grid
                container
                direction="row"
                className={container}
                justify="center"
            >
                {activeStep === 0 &&
                    <SelectEmpresa
                        data={data}
                        handleInput={handleInput}
                        handleBlur={handleBlur}
                    />
                }
                {
                   // razaoSocial && showForm()
                     true   ?
                        <Grid item xs={12}>
                            {activeStep < 3 &&
                                <Paper className={paper}>
                                    <h3 className='formSubtitle'> {subtitle[activeStep] + (placa && activeStep !== 0 ? ' - placa ' + placa : '')}</h3>

                                    <TextInput
                                        form={form}
                                        data={data}
                                        handleBlur={handleBlur}
                                        handleInput={handleInput}
                                    />
                                </Paper>}

                            {activeStep === 0 && tab === 0 &&
                                <Paper>
                                    <Grid container justify="center">
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
            {activeStep === 1 && <Grid
                container
                direction="row"
                justify="center"
                alignItems="center">
                <Grid>
                    <TextField
                        name='justificativa'
                        value={justificativa}
                        label='Justificativa'
                        type='text'
                        onChange={handleInput}
                        InputLabelProps={{ shrink: true, style: { fontWeight: 600, marginBottom: '5%' } }}
                        inputProps={{ style: { paddingBottom: '2%', width: '900px' } }}
                        multiline
                        rows={4}
                        variant='outlined'
                    />
                </Grid>
            </Grid>}
        </Fragment>
    )
}   