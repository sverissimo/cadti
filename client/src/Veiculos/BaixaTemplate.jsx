import React, { Fragment } from 'react'

import Crumbs from '../Utils/Crumbs'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'

import BaixaOptions from './BaixaOptions'


import { baixaForm } from '../Forms/baixaForm'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'


import './veiculos.css'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
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

export default function ({ handleInput, handleBlur, handleCheck, handleSubmit, data, empresas }) {
    const { razaoSocial, frota, checked, delegaTransf, justificativa, demand } = data,
        classes = useStyles(), { paper, container, formHolder } = classes


    return (
        <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Baixa de veículo' />
            <SelectEmpresa
                data={data}
                empresas={empresas}
                handleInput={handleInput}
                handleBlur={handleBlur}
                demand={demand}
            />
            <Grid
                container
                direction="row"
                className={container}
                justify="center"
            >
                {razaoSocial && frota[0] &&
                    <Grid item xs={12}>
                        <Paper className={paper}>
                            <h3>{!demand ? 'Informe os dados para a baixa' : `Solicitação nº${demand?.numero} - ${demand?.subject}`}</h3>
                            <TextInput
                                form={baixaForm}
                                data={data}
                                handleBlur={handleBlur}
                                handleInput={handleInput}
                                disableAll={demand ? true : false}
                            />
                        </Paper>

                        <BaixaOptions
                            demand={demand}
                            checked={checked}
                            delegaTransf={delegaTransf}
                            justificativa={justificativa}
                            empresas={empresas}                            
                            handleInput={handleInput}
                            handleBlur={handleBlur}
                            handleCheck={handleCheck}
                            handleSubmit={handleSubmit}
                        />
                        {/* <Grid container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                            style={{ width: checked === 'venda' || checked === 'outro' ? '1200px' : '600px', marginTop: '25px' }}
                        >
                            <Grid item xs={checked ? 6 : 12}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Motivo da baixa</FormLabel>
                                    <RadioGroup aria-label="position" name="position"
                                        onChange={handleCheck} row
                                        style={{ width: 'auto' }}
                                        className='radio'
                                    >
                                        <FormControlLabel
                                            className='radio'
                                            value="venda"
                                            control={<Radio color="primary" />}
                                            label={<span style={{ fontSize: '0.8rem' }}>{"Venda para outra empresa do sistema"}</span>}
                                            labelPlacement="start"

                                        />
                                        <FormControlLabel
                                            value="outro"
                                            control={<Radio color="primary" />}
                                            label={<span style={{ fontSize: '0.8rem' }}>{"Outro"}</span>}
                                            labelPlacement="start"
                                        />

                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            {checked === 'venda' ?
                              checkOptions('venda')
                                :
                                checked === 'outro' &&
                                <Grid item xs={6}>
                                    <TextField
                                        name='justificativa'
                                        value={justificativa}
                                        label='Justificativa'
                                        type='text'
                                        onChange={handleInput}
                                        InputLabelProps={{ shrink: true }}
                                        multiline
                                        rows={3}
                                        variant='outlined'
                                        fullWidth
                                    />
                                </Grid>
                            }
                        </Grid>
                        <Grid container direction="row" justify='flex-end' style={{ width: '1200px' }}>
                            <Grid item xs={11} style={{ width: '1000px' }}></Grid>
                            <Grid item xs={1} style={{ align: "right" }}>
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    style={{ margin: '10px 0 10px 0' }}
                                    onClick={() => handleSubmit()}
                                >
                                    Confirmar <span>&nbsp;&nbsp; </span> <Send />
                                </Button>
                            </Grid>
                        </Grid> */}
                    </Grid>
                }
                {!razaoSocial && !frota[0] &&
                    <Grid container justify="center">
                        <div className={formHolder}></div>
                    </Grid>}
            </Grid>
        </Fragment>
    )
}