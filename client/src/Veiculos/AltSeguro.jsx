import React from 'react'
import { Paper, Grid, Typography, TextField, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Add, Search } from '@material-ui/icons'
import Chip from '@material-ui/core/Chip'
import AutoComplete from '../Utils/autoComplete'

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

export default function AltSeguro({ data, handleInput, handleBlur, addPlateInsurance, handleDelete }) {
    const classes = useStyles(), { paper, title, textField } = classes
    const { insuranceExists, placa, apolice, addedPlaca, frota } = data

    let placas = []

    if (insuranceExists.hasOwnProperty('placas')) {
        
        if (insuranceExists.placas[0] !== null) placas = insuranceExists.placas
        if (placa !== undefined && placa.length > 2 && placas[0]) {
            if (typeof placa === 'string') placas = placas.filter(p => p.toLowerCase().match(placa.toLowerCase()))
            else placas = placas.filter(p => p.match(placa))
        }
    }

    return (
        <Paper className={paper}>
            <div style={{ width: '100%' }}>
                <Grid>
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
                                //color="primary"
                                variant="contained"
                                className={classes.button}
                                style={{ margin: '10px 0 10px 0' }}
                                onClick={() => addPlateInsurance(addedPlaca, apolice)}
                            //onClick={handleEquipa}
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

                    <Grid container spacing={1} alignItems="center" justify='center'>


                    </Grid>
                    {insuranceExists.hasOwnProperty('apolice') ? <div style={{ marginTop: '30px' }}>
                        <Typography className={title}>Placas vinculadas a apólice {insuranceExists.apolice}</Typography>
                    </div>
                        :
                        <div style={{ marginTop: '30px' }}></div>
                    }
                    {
                        placas && placas[0] && placas.map((placa, i) =>
                            <Chip
                                key={i}
                                //icon={icon}
                                label={placa}
                                onDelete={() => handleDelete(placa)}
                                className={classes.chip}
                                color='primary'
                                variant="outlined"
                            />
                        )
                    }
                </Grid>

                {/* 
                    open && <PopUp
                    close={handleClose}
                    title={'Inserir Placas'}
                    format={{
                        top: '10%',
                        left: '10%',
                        right: '10%'
                    }}
                >
                    <AddPlaca
                        frota={frota}
                        plate={plate}
                        placasArray={addPlates}
                        setPlate={setPlate}
                        addPlates={addPlates}
                    />
                </PopUp> */
                }


            </div>
        </Paper>
    )
}