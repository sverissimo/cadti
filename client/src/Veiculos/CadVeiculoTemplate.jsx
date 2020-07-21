import React, { useState } from 'react'

import TextInput from '../Reusable Components/TextInput'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { cadVehicleForm } from '../Forms/cadVehicleForm'

import AutoComplete from '../Utils/autoComplete'
import AddEquipa from './AddEquipa'

import './veiculos.css'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: '6px'
    },
    title: {
        color: '#000',
        fontWeight: 400,
        fontSize: '0.9rem',
        textAlign: 'center'
    },
    selectEmpresa: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        minWidth: 350,
        fontColor: '#bbb',
    },
    formHolder: {
        width: 900,
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
}));

export default function ({ empresas, equipamentos, acessibilidade, data, handleInput, handleBlur, handleEquipa, handleCheck }) {

    
    
    const
        classes = useStyles(),
        { paper, container, title, selectEmpresa, button, formHolder } = classes,

        { razaoSocial, activeStep, addEquipa, delegatarioCompartilhado, subtitle, selectedEmpresa, type } = data,

        form = cadVehicleForm[activeStep],
        [shared, setShared] = useState(false)

    let eqCollection = equipamentos
    if (type === 'acessibilidade') eqCollection = acessibilidade

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
                        {activeStep === 0 ?
                            <Grid item xs={shared ? 4 : 12} style={{ marginBottom: '15px' }}>
                                <Typography className={title}> Selecione a Viação</Typography>

                                <TextField
                                    inputProps={{
                                        list: 'razaoSocial',
                                        name: 'razaoSocial',
                                        style: { textAlign: 'center', fontSize: '0.8rem' }
                                    }}
                                    className={selectEmpresa}
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
                                        style: { textAlign: 'center', fontSize: '0.8rem' }
                                    }}
                                    className={selectEmpresa}
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
                    //selectedEmpresa
                    true ?
                        <Grid item xs={12}>
                            {activeStep < 2 &&
                                <Paper className={paper}>
                                    <div className='formSubtitle'> {subtitle[activeStep]}</div>
                                    <TextInput
                                        form={form}
                                        data={data}
                                        handleBlur={handleBlur}
                                        handleInput={handleInput}
                                    />
                                </Paper>}
                            {activeStep === 0 &&
                                <Grid container justify="center" style={{ marginTop: '15px' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="primary"
                                        className={button}
                                        onClick={() => handleEquipa('equipamentos')}
                                    >
                                        <AddIcon />
                                                Equipamentos
                                            </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="primary"
                                        className={button}
                                        onClick={() => handleEquipa('acessibilidade')}
                                    >
                                        <AddIcon />
                                        Acessibilidade
                                    </Button>
                                </Grid>}

                            {
                                addEquipa && <AddEquipa
                                    equipamentos={eqCollection}
                                    close={handleEquipa}
                                    handleCheck={handleCheck}
                                    data={data} />
                            }
                        </Grid>
                        :
                        <Grid container justify="center">
                            <div className={formHolder}></div>
                        </Grid>
                }
            </Grid>
        </Grid>
    )
}