import React, { Fragment, useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'

import AttachFileIcon from '@material-ui/icons/AttachFile';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import ClosePopUpButton from './ClosePopUpButton';

export default function DragAndDrop({ title, name, formData, handleFiles, dropDisplay, single, style, demandFiles, fileToRemove }) {

    const [fileName, setFileName] = useState()
    console.log(fileToRemove)

    useEffect(() => {
        if (demandFiles && demandFiles[0]) {
            demandFiles.forEach(({ filename, metadata }) => {
                if (name === metadata.fieldName) {
                    setFileName(filename)
                }
            })
        }

        if (formData instanceof FormData) {
            for (let pair of formData.entries()) {
                if (name === pair[0]) {
                    setFileName(pair[1].name)
                }
                if (name === fileToRemove) {
                    setFileName(undefined)
                    fileToRemove = null
                }
            }
        }
        return () => setFileName()
    }, [formData, name, demandFiles, fileToRemove])


    return (
        <div style={style ? style : null}>
            <div style={{ position: 'relative', marginRight: '8px' }}>
                <p className='fileInput'>{title || 'Anexar arquivo'}</p>
                {fileName && <ClosePopUpButton title={'Remover arquivo'} close={handleFiles} closeFiles={true} name={name} />}
            </div>
            <Dropzone onDrop={e => handleFiles(e, name)}>
                {({ getRootProps, getInputProps }) => (
                    <div className={fileName ? 'dropBox fileAttached' : single ? 'dropBox' : 'multipleDropBox'} {...getRootProps()}>
                        <input {...getInputProps()} />
                        {
                            fileName ?
                                <Fragment>
                                    <div> <DescriptionOutlinedIcon className='icon' />  {fileName} </div>
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
