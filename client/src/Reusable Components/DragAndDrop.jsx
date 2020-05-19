import React, { Fragment, useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'

import AttachFileIcon from '@material-ui/icons/AttachFile';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';

export default function DragAndDrop({ title, name, formData, handleFiles, dropDisplay, single, style }) {

    const [fileName, setFileName] = useState()

    useEffect(() => {
        if (formData && typeof formData === 'object') {
            for (let pair of formData.entries()) {
                if (name === pair[0]) {
                    setFileName(pair[1].name)
                }
            }
        }
        else setFileName(null)
    }, [formData, name])

    return (
        <div style={style ? style : null}>
            {title && <p className='fileInput'>{title}</p>}
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
