import React from 'react'

export default function RemoveFileButton({ name, removeFile }) {
    return (
        <div style={{
            position: 'absolute',
            top: '0.4%',
            right: '0.4%'
        }}>
            <div>
                <i
                    className="material-icons right"
                    title='Remover arquivo'
                    style={{ cursor: 'pointer', color: 'red' }}
                    onClick={() => removeFile(name)}>
                    close
                        </i>
            </div>
        </div>
    )
}