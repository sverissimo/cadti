import React from 'react'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { vehiculeForm } from '../Forms/vehiculeForm'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(2)
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        fontSize: '0.7rem',
        fontColor: '#bbb',
        textAlign: 'center'     
    },
    input: {
        textAlign: 'center'        
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(2)
    },
    button: {
        margin: theme.spacing(1),
        float: 'right',
    },

}));

export default function ({ tab, items }) {
    const classes = useStyles(), { paper, container } = classes
    return (
        <Grid
            container
            direction="row"
            className={container}
        >
            <Grid>
                <Paper className={paper}>
                    <Typography> Selecione a Viação</Typography>
                    <br />
                    <TextField select={true} className={classes.textField} value='' primaryText={'hi'}>
                        <option value='x1'>x</option>
                        <option value='x22'>y</option>
                        <option value='x33'>z</option>
                        <option value='x44'>w</option>
                    </TextField>
                    <br />
                    {items[tab]} - Viação Xyz
                </Paper>
                <Grid item xs={12}>
                    <Paper className={paper}>
                        <Typography> Preencha dos dados do veículo</Typography>
                        {vehiculeForm[tab].map((el, i) =>
                            <TextField
                                id="standard-name"
                                key={i}
                                name={el.field}
                                label={el.label}
                                margin={el.margin}
                                className={classes.textField}
                                InputLabelProps={{ className: classes.textField }}
                                InputProps={{ className: classes.input }}
                            />
                        )}
                        <div>
                            <Button variant="contained" color="primary" className={classes.button}>
                                Enviar
                        </Button>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    )
}