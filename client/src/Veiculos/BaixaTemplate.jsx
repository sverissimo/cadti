import React, { Fragment } from 'react'

import Crumbs from '../Reusable Components/Crumbs'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'

import BaixaOptions from './BaixaOptions'

import { baixaForm } from '../Forms/baixaForm'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

import './veiculos.scss'

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
            <Crumbs links={['Veículos', '/veiculos']} text='Baixa de veículo' demand={demand} />
            <SelectEmpresa
                data={data}
                empresas={empresas}
                handleInput={handleInput}
                handleBlur={handleBlur}
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
                            <h3 style={{ marginBottom: '7px' }}>
                                {!demand ? 'Informe os dados para a baixa' : `Solicitação nº${demand?.numero} - ${demand?.subject}`}
                            </h3>
                            {demand && <h4>Situação: {demand?.status}</h4>}
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