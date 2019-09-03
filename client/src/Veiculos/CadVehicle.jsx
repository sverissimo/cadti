import React, { Fragment } from 'react'
import { Grid, Paper, TextField, Button, } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'

const useStyles = makeStyles(theme => ({

    root: {
        flexGrow: '1',
        margin: '1%',
        padding: '1%',

    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: '2%',
        width: "97%",
        fontSize: '0.8rem',
        fontColor: '#bbb',
    },
    input: {
        display: 'none'
    },
    paper: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(2),
        width: "100%",
        padding: '2% 0 4% 0',
        height: '400px'
    },

    button: {
        margin: '3% 0 3% 0',        
        backgroundColor: 'LightSkyBlue',
        float: 'right'
    },
    text: {
        textAlign: 'left',
        margin: theme.spacing(2),
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#333'
    },
    resize: {
        fontSize: '0.8rem',
        color: '#888'
    }
}));



const link = (id) => {
    document.getElementById(id).click()
}

export default function CadVehicle({ handleFiles, data, handleSubmit }) {
    const { root, textField, button, input, paper, resize } = useStyles()
    return (
        <div className={root}>
            <Paper className={paper}>
                <Grid container>
                    {cadVehicleFiles.map(({ title, name }, k) =>
                        <Fragment key={k}>

                            <Grid item xs={10} md={4} style={{ cursor: 'pointer' }} >
                                <TextField
                                    className={textField}
                                    fullWidth={true}
                                    placeholder='Selecionar arquivo'
                                    value={data[name] || ''}
                                    onChange={handleFiles}
                                    onClick={() => link(name)}
                                    disabled={true}
                                    InputProps={{ classes: { input: resize } }}
                                    label={title}
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                />

                            </Grid>


                            <Grid item xs={2} md={1}>
                                <Button
                                    variant="contained"
                                    component='label'
                                    //className={button}
                                    color='primary'
                                >
                                    {'Selecionar'}
                                    <input
                                        id={name}
                                        className={input}
                                        name={name}
                                        type="file"
                                        onChange={handleFiles}
                                    />
                                </Button>
                            </Grid>
                            <Grid item md={1}></Grid>
                        </Fragment>
                    )}
                    <Grid item md={12}>
                        <Button
                            variant="contained"
                            component='label'
                            className={button}
                            color='primary'
                            onClick={handleSubmit}
                        > Enviar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>



        </div>
    )
}

