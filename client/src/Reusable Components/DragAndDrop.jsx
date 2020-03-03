import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'

import AttachFileIcon from '@material-ui/icons/AttachFile';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';

export default function DragAndDrop({ title, name, formData, handleFiles, dropDisplay }) {

    const [fileName, setFileName] = useState()

    useEffect(() => {
        if (formData && typeof formData === 'object') {            
            for (let pair of formData.entries()) {
                if (name === pair[0]) {
                    setFileName(pair[1].name)
                }
            }
        }
    }, [formData, name])

    return (
        <>
            {title && <p className='fileInput'>{title}</p>}
            <Dropzone onDrop={e => handleFiles(e, name)}>
                {({ getRootProps, getInputProps }) => (
                    <div className={fileName ? 'dropBox fileAttached' : 'multipleDropBox'} {...getRootProps()}>
                        <input {...getInputProps()} />
                        {
                            fileName ?
                                <div> <DescriptionOutlinedIcon className='icon' />  {fileName} </div>
                                :
                                <div> <AttachFileIcon className='icon' /> <span>  {dropDisplay}</span> </div>
                        }
                    </div>
                )}
            </Dropzone>
        </>
    )
}
