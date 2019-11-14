import React, { Fragment } from 'react'
import { Grid, Paper, TextField, Button, } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { altDadosFiles } from '../Forms/altDadosFiles'

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
        color: theme.palette.text.secondary,
        margin: theme.spacing(2),
        width: "100%",
        padding: '2% 0 4% 0',
        height: '400px'
    },
    button: {
        margin: '3% 0 3% 0',
        //backgroundColor: 'DodgerBlue',
        float: 'right bottom'
    },
    sendButton: {
        margin: '3% 0 3% 0',
        backgroundColor: 'teal',
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
    },
    item: {
        marginTop: '2%'
    }
}))

const link = (id) => {
    document.getElementById(id).click()
}

export default function VehicleDocs({ handleFiles,  tab }) {
    const { root, textField, button, input, paper, resize, item } = useStyles()

    let filesForm
    if (tab === 0) filesForm = cadVehicleFiles
    if (tab === 2) filesForm = altDadosFiles


    return (
        <div >
            <Paper className={paper}>
                <Grid container className={root}>
                    {filesForm.map(({ title, name }, k) =>
                        <Fragment key={k}>
                            <Grid item xs={10} md={4} className={item}>
                                <TextField
                                    id={name}
                                    className={textField}
                                    fullWidth={true}
                                    placeholder='Nenhum arquivo selecionado'
                                    onChange={handleFiles}
                                    onClick={() => link(name)}
                                    disabled={true}
                                    InputProps={{ classes: { input: resize } }}
                                    label={title}
                                    InputLabelProps={{
                                        shrink: true,
                                        style: { fontWeight: 500, color: '#000', marginBottom: '5%' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={2} md={1} style={{ paddingTop: '2%' }}>
                                <Button
                                    variant="outlined"
                                    component='label'
                                    className={button}
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
                </Grid>
            </Paper>
        </div>
    )
}
