import React from 'react'

import TextInput from '../Reusable Components/TextInput'
import Dropzone from 'react-dropzone'

import Grid from '@material-ui/core/Grid'
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import { makeStyles } from '@material-ui/core/styles'

import { empresasForm } from '../Forms/empresasForm'
import FormSubtitle from '../Reusable Components/FormSubtiltle'
import DragAndDrop from '../Reusable Components/DragAndDrop'


const useStyles = makeStyles(theme => ({

    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        fontColor: '#bbb',
        textAlign: 'center'
    },
    formHolder: {
        width: 900,
    },
    input: {
        textAlign: 'center'
    },

    dropBox: {
        margin: '2% 0',
    },
    dropBoxItem: {
        margin: '12px 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '50px',
        padding: '17px',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        fontSize: '0.75rem',
        color: '#4169E1',
        backgroundColor: '#fafafa'
    },
    dropBoxItem2: {
        margin: '12px 0',
        border: '1px solid #ccc',
        borderRadius: '3%',
        height: '50px',
        padding: '0 1% 0 1%',
        cursor: 'pointer',
        zIndex: '1',
        boxShadow: 'inset 3px -3px -3px 0px black',
        fontSize: '0.75rem',
        color: '#00000',
        backgroundColor: '#fafafa'
    }
}));

export default function ({ handleInput, handleBlur, data, handleFiles, removeFile }) {
    const { activeStep, stepTitles, dropDisplay, contratoSocial, fileToRemove} = data
           
    return (
        <div className="flex paper">
            <FormSubtitle subtitle={stepTitles[activeStep]} />
            <div>
                <TextInput
                    form={empresasForm}
                    data={data}
                    handleBlur={handleBlur}
                    handleInput={handleInput}
                />
                <div className='flex center'>
                    <DragAndDrop
                        name='contratoSocial'
                        formData={contratoSocial}
                        dropDisplay={dropDisplay}
                        handleFiles={handleFiles}                        
                        removeFile={removeFile}
                        fileToRemove={fileToRemove}
                        style={{ width: '40%' }}
                    />
                </div>


                {/*    <Dropzone onDrop={handleFiles}>
                    {({ getRootProps, getInputProps }) => (
                        <Grid container justify="center" alignItems='center' className={dropBox} direction='row' {...getRootProps()}>
                            <input {...getInputProps()} />
                            {
                                dropDisplay.match('Clique ou') ?
                                    <Grid item xs={6} className={dropBoxItem}> {dropDisplay} </Grid>
                                    :
                                    <Grid item xs={6} className={dropBoxItem2}> <DescriptionOutlinedIcon />  {dropDisplay} <br /> (clique ou arraste outro arquivo para alterar)</Grid>
                            }
                        </Grid>
                    )}
                </Dropzone> */}
            </div>
        </div>
    )
}