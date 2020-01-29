import React, { Fragment } from 'react'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { altDadosFiles } from '../Forms/altDadosFiles'

const useStyles = makeStyles(theme => ({

    root: {
        flexGrow: '1',
        margin: '5px',
        padding: '8px',
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
        width: "100%",
        padding: '8px 0 14px 0',
        height: 'auto',
        minHeight: '350px'
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

export default function VehicleDocs({ handleFiles, parentComponent }) {
    const { root, textField, button, input, paper, resize, item } = useStyles()

    let filesForm
    if (parentComponent === 'cadastro') filesForm = cadVehicleFiles
    if (parentComponent === 'altDados') filesForm = altDadosFiles


    return (
        <div >
            <Paper className={paper}>
            <div className="formSubtitle"> Anexe os documentos solicitados nos campos abaixo </div>
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

