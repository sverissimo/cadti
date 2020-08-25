import React from 'react'

import TextInput from '../Reusable Components/TextInput'

import { empresasForm } from '../Forms/empresasForm'
import FormSubtitle from '../Reusable Components/FormSubtiltle'
import DragAndDrop from '../Reusable Components/DragAndDrop'

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
            </div>
        </div>
    )
}