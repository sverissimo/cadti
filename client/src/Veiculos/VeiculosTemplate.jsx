import React from 'react'
import { Grid, Paper, Button, Typography, MenuItem } from '@material-ui/core'
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

export default function ({ tab, items, empresas, selectEmpresa, selectedEmpresa }) {
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
                    <TextField select={true} className={classes.textField} value={selectedEmpresa} onChange={selectEmpresa}>
                        {empresas.map((e, i) => <MenuItem key={i} value={e}>{e}</MenuItem>)}
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