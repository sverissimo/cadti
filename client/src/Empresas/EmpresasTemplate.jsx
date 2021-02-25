import React from 'react'

import TextInput from '../Reusable Components/TextInput'

import { empresasForm } from '../Forms/empresasForm'
import FormSubtitle from '../Reusable Components/FormSubtiltle'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import cadEmpresaForm from '../Forms/cadEmpresaForm'

export default function ({ handleInput, handleBlur, data, handleFiles, removeFile }) {
    const { activeStep, stepTitles, form, fileToRemove } = data

    return (
        <div className="flex paper">
            <FormSubtitle subtitle={stepTitles[activeStep]} />
            <main>
                <TextInput
                    form={empresasForm}
                    data={data}
                    handleBlur={handleBlur}
                    handleInput={handleInput}
                />
                <div className='flex center'>
                    {
                        cadEmpresaForm.map(({ name, title }, i) =>
                            <DragAndDrop
                                key={i}
                                name={name}
                                formData={form}
                                dropDisplay={`Clique ou arraste para anexar o ${title}`}
                                handleFiles={handleFiles}
                                removeFile={removeFile}
                                fileToRemove={fileToRemove}
                                style={{ width: '25%', marginRight: i === 0 ? '12px' : 0 }}
                            />
                        )
                    }
                </div>
            </main>
        </div>
    )
}