import React, { Fragment } from 'react'

import DragAndDrop from '../Reusable Components/DragAndDrop'
import FormSubtitle from '../Reusable Components/FormSubtitle'

import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { altDadosFiles } from '../Forms/altDadosFiles'

const useStyles = makeStyles(theme => ({

    root: {
        flexGrow: '1',
        margin: '5px',
        padding: '8px',
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
        margin: '0 0 18px 0',
        padding: '0 5px'
    }
}))

export default function VehicleDocs({ handleFiles, parentComponent, dropDisplay, formData, insuranceExists, demandFiles, removeFile, fileToRemove }) {
    const { root, item } = useStyles()

    let filesForm
    if (parentComponent === 'cadastro') filesForm = cadVehicleFiles
    if (parentComponent === 'altDados') filesForm = altDadosFiles

    return (
        <div className='paper' style={{ color: '#555' }} >
            <FormSubtitle subtitle='Anexe os documentos solicitados nos campos abaixo' />
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
                                    removeFile={removeFile}
                                    fileToRemove={fileToRemove}
                                />
                            </Grid>
                        </Fragment>
                )}
            </Grid>
        </div>
    )
}