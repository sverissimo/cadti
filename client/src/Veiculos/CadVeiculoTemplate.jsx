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
import { cadForm } from '../Forms/cadForm'

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
    }
}));

export default function ({ handleInput, handleBlur, data, handleEquipa, handleCheck,
    altPlacaOption, showAltPlaca }) {
    const { empresas, razaoSocial, activeStep, equipamentos, addEquipa,
        delegatarioCompartilhado, subtitle, placa, selectedEmpresa } = data,

        classes = useStyles(), { paper, container, title, selectEmpresa,
            button, formHolder } = classes

    const [shared, setShared] = useState(false)

    const form = cadForm[activeStep]

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
                    selectedEmpresa
                        ?
                        <Grid item xs={12}>
                            {activeStep < 3 &&
                                <Paper className={paper}>
                                    <div className='formSubtitle'> {subtitle[activeStep]}</div>
                                    <TextInput
                                        form={form}
                                        data={data}
                                        handleBlur={handleBlur}
                                        handleInput={handleInput}
                                    />
                                    {activeStep === 0 && <Grid container justify="center"
                                    >
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            className={button}
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
                            <div className={formHolder}></div>
                        </Grid>
                }
            </Grid>
        </Grid>
    )
}