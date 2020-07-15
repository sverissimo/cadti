import React, { Fragment } from 'react'

import DragAndDrop from '../Reusable Components/DragAndDrop'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { altDadosFiles } from '../Forms/altDadosFiles'

const useStyles = makeStyles(theme => ({

    root: {
        flexGrow: '1',
        margin: '5px',
        padding: '8px',
    },
    paper: {
        color: theme.palette.text.secondary,
        width: "100%",
        padding: '8px 0 14px 0',
        height: 'auto',
        minHeight: '350px'
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
    item: {
        marginTop: '10px',
        padding: '0 5px'
    }
}))

export default function VehicleDocs({ handleFiles, parentComponent, dropDisplay, formData, insuranceExists, demandFiles, fileToRemove }) {
    const { root, paper, item } = useStyles()

    let filesForm
    if (parentComponent === 'cadastro') filesForm = cadVehicleFiles
    if (parentComponent === 'altDados') filesForm = altDadosFiles

    return (
        <div >
            <Paper className={paper}>
                <div className="formSubtitle"> Anexe os documentos solicitados nos campos abaixo </div>
                <Grid container className={root}>
                    {filesForm.map(({ title, name }, k) =>
                        name === 'apoliceDoc' && insuranceExists ? null :
                            <Fragment key={k}>
                                <Grid item xs={10} md={4} className={item}>
                                    <DragAndDrop
                                        title={title}
                                        name={name}
                                        formData={formData}
                                        dropDisplay={dropDisplay}
                                        handleFiles={handleFiles}
                                        demandFiles={demandFiles}
                                        fileToRemove={fileToRemove}
                                    />
                                </Grid>
                            </Fragment>
                    )}
                </Grid>
            </Paper>
        </div>
    )
}