import React, { Fragment, useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'

import AttachFileIcon from '@material-ui/icons/AttachFile';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import RemoveFileButton from './RemoveFileButton';


export default function DragAndDrop({ title, name, formData, handleFiles, dropDisplay, single, style, demandFiles, fileToRemove, removeFile }) {

    const [fileName, setFileName] = useState()
    const [fileExists, setFileExistance] = useState()

    //*************Set demandFiles names, if there are any
    useEffect(() => {
        if (demandFiles && demandFiles[0]) {
            demandFiles.forEach(({ filename, metadata }) => {
                if (name === metadata.fieldName) {
                    setFileName(filename)
                    setFileExistance(true)    
                }
            })
        }
    }, [demandFiles, name])


    //*************If there's formData from props there's a new file being attached.
    useEffect(() => {
        if (formData instanceof FormData) {
            for (let pair of formData.entries()) {
                if (name === pair[0]) {     //Attach the file if there'no command to remove
                    setFileName(pair[1].name)
                    setFileExistance(false)
                }
            }
        } else if (!formData && !demandFiles) setFileName(null)
    }, [formData, name, demandFiles, fileToRemove])    

    //*****************Remove file name from rendered field *********/    
    useEffect(() => {

        if (fileToRemove === name) {
            const demandFile = demandFiles?.find(f => f?.metadata?.fieldName === fileToRemove)

            if (fileToRemove && demandFile) {
                setFileName(demandFile.filename)
                setFileExistance(true)
            }
            else if (fileToRemove && fileToRemove === name) {
                setFileName(undefined)
            }
        }
    }, [demandFiles, fileToRemove, handleFiles, name])

    return (
        <div style={style ? style : null}>
            <div style={{ position: 'relative', marginRight: '8px' }}>
                {title ? <p className='fileInput'>{title || ''}</p>
                    : <br />}
                {fileName && !fileExists &&
                    <RemoveFileButton removeFile={removeFile} name={name} />
                }
            </div>
            <Dropzone onDrop={e => handleFiles(e, name)}>
                {({ getRootProps, getInputProps }) => (
                    <div
                        style={fileExists ? { backgroundColor: '#aaa' } : {}}
                        className={fileName ? 'dropBox fileAttached' : single ? 'dropBox' : 'multipleDropBox'} {...getRootProps()}>
                        <input {...getInputProps()} />
                        {
                            fileName ?
                                <Fragment>
                                    <div>
                                        <DescriptionOutlinedIcon className='icon' />
                                        {fileName}
                                    </div>
                                    {single &&
                                        <span>(clique ou arraste outro arquivo para alterar)</span>
                                    }
                                </Fragment>
                                :
                                <div> <AttachFileIcon className='icon' />
                                    <span>  {dropDisplay}</span>
                                </div>
                        }
                    </div>
                )}
            </Dropzone>
        </div>
    )
}
