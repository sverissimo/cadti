import React from 'react'
import { Paper, Grid, Typography, TextField, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import Chip from '@material-ui/core/Chip'

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
    },
}))



export default function AltSeguro({ data, handleInput, handleBlur }) {
    const classes = useStyles(), { paper, title, textField } = classes
    const { insuranceExists, placa } = data

    let placas = []    
    if (insuranceExists !== '') {
        placas = insuranceExists.placas
       if(placa !== undefined && placa.length > 2) {
           if(typeof placa === 'string')placas = placas.filter(p=> p.toLowerCase().match(placa.toLowerCase()))
           else placas = placas.filter(p=> p.match(placa))
       }
        /* let obj = placas.reduce((obj, v) => {
            obj[placas.indexOf(v)] = v
            return obj
        }, {})
        
        for (let value of Object.values(obj)) {
            vSegurados.push({ placa: value })
        }        */
    }

    const handleDelete = (placa) => {
        console.log(placa)
    }

    return (
        <Paper className={paper}>
            <Grid
                container
                direction="row"
                justify="space-evenly"
                alignItems="baseline"
            >
                {insuranceExists && <Grid>
                    <Typography className={title}>Utilize as opções abaixo para pesquisar, inserir ou excluir veículos</Typography>
                    <TextField
                        inputProps={{                      
                            name: 'placa',
                        }}
                        InputLabelProps={{
                            style: {fontSize: '0.8rem'}
                        }}
                        label='Pesquisar placas'
                        className={textField}
                        value={placa || ''}
                        onChange={handleInput}
                        onBlur={handleBlur}
                        variant = 'outlined'
                    />                  
                    <Grid container justify="flex-end"
                    >
                        <Button
                            size="small"
                            //color="primary"
                            variant="contained"
                            className={classes.button}
                            style={{ margin: '10px 0 10px 0' }}
                        //onClick={handleEquipa}
                        >
                            <AddIcon /> Adicionar Veículos
                                </Button>
                    </Grid>
                    {
                        placas && placas.map((placa, i) =>
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
                }

            </Grid>
        </Paper>
    )
}

