import React, { Fragment } from 'react'

import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'
import AddEquipa from './AddEquipa'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
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
    },
    button: {
        marginRight: '15px'
    }
}))

export default function ({ handleInput, handleBlur, data, handleCheck, handleEquipa, altPlacaOption, showAltPlaca, empresas, equipamentos, acessibilidade, close }) {

    const
        { activeStep, subtitle, placa, selectedEmpresa, addEquipa, demand, type } = data,
        classes = useStyles(), { paper, container } = classes

    let
        form = altForm[activeStep],
        eqCollection = equipamentos

    if (type === 'acessibilidade') eqCollection = acessibilidade

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
                        empresas={empresas}
                        handleInput={handleInput}
                        handleBlur={handleBlur}
                        demand={demand}
                    />
                }
                {
                    selectedEmpresa ?
                        <Grid item xs={12}>
                            {activeStep < 3 &&
                                <Paper className={paper}>
                                    <h3 className='formSubtitle'> {subtitle[activeStep] + (placa && activeStep !== 0 ? ' - placa ' + placa : '')}</h3>

                                    <TextInput
                                        form={form}
                                        data={data}
                                        empresas={empresas}
                                        handleBlur={handleBlur}
                                        handleInput={handleInput}
                                        disableSome={demand ? ['placa', 'delegatario'] : ['delegatario']}
                                    />
                                </Paper>}

                            {activeStep === 0 &&
                                <Grid container justify="center" style={{ paddingRight: '15px' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="primary"
                                        className={classes.button}
                                        onClick={() => handleEquipa('equipamentos')}
                                    >
                                        <AddIcon />
                                        Equipamentos
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="primary"
                                        className={classes.button}
                                        onClick={() => handleEquipa('acessibilidade')}
                                    >
                                        <AddIcon />
                                        Acessibilidade
                                    </Button>
                                </Grid>}

                            {altPlacaOption && placa.match('[a-zA-Z]{3}[-]?\\d{4}') &&
                                <div className='addNewDiv'>
                                    <span onClick={() => showAltPlaca()}> → Clique aqui para alterar a placa para o formato Mercosul.</span>
                                </div>
                            }
                            {
                                addEquipa && <AddEquipa
                                    type={type}
                                    equipamentos={eqCollection}
                                    close={close}
                                    handleCheck={handleCheck}
                                    data={data} />
                            }
                        </Grid>
                        :
                        <Grid container justify="center">
                            <div className={classes.formHolder}></div>
                        </Grid>
                }
            </Grid>          
        </Fragment>
    )
}   