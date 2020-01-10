import React, { Fragment } from 'react'

import Crumbs from '../Utils/Crumbs'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { Add, Search } from '@material-ui/icons'
import Chip from '@material-ui/core/Chip'
import AutoComplete from '../Utils/autoComplete'

import { seguroForm } from '../Forms/seguroForm'

const useStyles = makeStyles(theme => ({

    root: {

    },
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
    const classes = useStyles(), { paper, title, textField } = classes
    const { empresas, razaoSocial, placa, apolice, addedPlaca, frota } = data

    const errorHandler = () => { }
    const helper = () => { }

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
                <Paper className={paper} style={{ padding: '0 2% 0 2%' }}>
                    <Grid container justify="center">
                        <Grid item xs={12} style={{ marginBottom: '15px' }}>
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
                    </Grid>
                </Paper>


                {
                    seguroForm.map((el, i) =>
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
                            />

                            {el.autoComplete === true && <AutoComplete
                                collection={data[el.collection]}
                                datalist={el.datalist}
                                value={data[el.field] || ''}
                            />
                            }
                        </Fragment>)}



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
                    {
                        insuranceExists && placas && placas[0] && placas.map((placa, i) =>
                            <Chip
                                key={i} 
                                label={placa}
                                onDelete={() => deleteInsurance(placa)}
                                className={classes.chip}
                                color='primary'
                                variant="outlined"
                            />
                        )
                    }
                </Paper> 
        </div>
    )
}