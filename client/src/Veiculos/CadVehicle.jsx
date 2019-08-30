import React, { Fragment } from 'react'
import { Grid, Paper, Typography, TextField, Button, } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'


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


        //backgroundColor: 'LightSkyBlue',
        //color: 'white'
        // float: 'right'
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

const docs = ['CRLV do Veículo', 'Apólice do Seguro']

const link = (id) => {
    document.getElementById(id).click()
}

export default function CadVehicle({ handleFiles, fileName }) {

    const { root, textField, button, input, paper, text, resize } = useStyles()
    return (
        <div className={root}>
            <Paper className={paper}>
                <Grid container>
                    {docs.map((d, k) =>
                        <Fragment key={k}>

                            <Grid item xs={10} md={4} >
                                <TextField
                                    className={textField}
                                    fullWidth={true}
                                    placeholder='Selecionar arquivo'
                                    value={fileName}
                                    onClick={() => link(k)}
                                    disabled={true}
                                    InputProps={{ classes: { input: resize } }}
                                    label={d}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />

                            </Grid>


                            <Grid item xs={2} md={1}>
                                <Button
                                    variant="contained"
                                    component='label'
                                    className={button}
                                    color='primary'
                                >
                                    {'Selecionar'}
                                    <input
                                        className={input}
                                        id={k}
                                        name='files'
                                        type="file"
                                        onChange={handleFiles}
                                    />
                                </Button>
                            </Grid>
                            <Grid md={1}></Grid>
                        </Fragment>
                    )}
                </Grid>
            </Paper>



        </div>
    )
}

