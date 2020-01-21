import React from 'react'

import Crumbs from '../Utils/Crumbs'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { Add, Search } from '@material-ui/icons'
import Chip from '@material-ui/core/Chip'
import AutoComplete from '../Utils/autoComplete'

import { seguroForm } from '../Forms/altSegForm'
import './veiculos.css'

const useStyles = makeStyles(theme => ({

    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(1)
    },
    title: {
        color: '#000',
        fontWeight: 400,
        fontSize: '0.9rem',
        textAlign: 'center',
        marginBottom: '20px'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    chip: {
        margin: theme.spacing(0.5),
    }
}))

export default function AltSeguro({ data, insuranceExists, handleInput, handleBlur, addPlateInsurance, deleteInsurance, handleDelete }) {
    const classes = useStyles(), { paper, title, textField, chip } = classes
    const { placa, apolice, addedPlaca, frota } = data

    let placas = []

    if (insuranceExists.hasOwnProperty('placas')) {

        if (insuranceExists.placas[0] !== null) placas = insuranceExists.placas.sort()
        if (placa !== undefined && placa.length > 2 && placas[0]) {
            if (typeof placa === 'string') placas = insuranceExists.placas.filter(p => p.toLowerCase().match(placa.toLowerCase())).sort()
            else placas = insuranceExists.placas.filter(p => p.match(placa)).sort()
        }
    }

    return (

        <div style={{ width: '100%' }}>
            <Crumbs links={['Veículos', '/veiculos']} text='Seguros' />
            <SelectEmpresa
                data={data}
                handleInput={handleInput}
                handleBlur={handleBlur}
            />
            <Paper className={paper}>
                <h3 className='formSubtitle'>Informe os dados do seguro.</h3>
                <TextInput
                    form={seguroForm}
                    data={data}
                    handleBlur={handleBlur}
                    handleInput={handleInput}
                />
            </Paper>

            <Paper className={paper}>
                <Typography className={title}>Utilize as opções abaixo para filtrar, adicionar ou excluir placas desta apólice</Typography>
                <Grid container justify="space-around" alignItems='flex-end' spacing={2}>
                    <Grid item>
                        <TextField
                            inputProps={{
                                name: 'addedPlaca',
                                list: 'placa'
                            }}
                            InputLabelProps={{
                                style: { fontSize: '0.8rem' }
                            }}
                            label='Insira a placa'
                            className={textField}
                            value={addedPlaca}
                            onChange={handleInput}
                            onBlur={handleBlur}
                        />
                        <AutoComplete
                            collection={frota}
                            datalist='placa'
                            value={addedPlaca}
                        />
                        <Button
                            size="small"
                            variant="contained"
                            className={classes.button}
                            style={{ margin: '10px 0 10px 0' }}
                            onClick={() => addPlateInsurance(addedPlaca, apolice)}
                        >
                            <Add /> Adicionar
                            </Button>
                    </Grid>

                    <Grid item>
                        <TextField
                            inputProps={{
                                name: 'placa',
                            }}
                            InputLabelProps={{
                                style: { fontSize: '0.8rem' }
                            }}
                            label='Filtrar'
                            className={textField}
                            value={placa || ''}
                            onChange={handleInput}
                            onBlur={handleBlur}
                        />
                        <Search style={{ marginTop: '18px' }} />
                    </Grid>
                </Grid>

                <Grid container spacing={1} alignItems="center" justify='center'></Grid>

                {insuranceExists.hasOwnProperty('apolice') ? <div style={{ marginTop: '30px' }}>
                    <Typography className={title}>Placas vinculadas a apólice {insuranceExists.apolice}</Typography>
                </div>
                    :
                    <div style={{ marginTop: '30px' }}></div>
                }
                {insuranceExists && placas && placas[0] && placas.map((placa, i) =>
                    <Chip
                        key={i}
                        label={placa}
                        onDelete={() => deleteInsurance(placa)}
                        className={chip}
                        color='primary'
                        variant="outlined"
                    />
                )}
            </Paper>
        </div>
    )
}