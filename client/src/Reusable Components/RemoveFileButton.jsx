import React from 'react'

export default function RemoveFileButton({ close, title = 'Fechar', closeFiles, name }) {
    return (
        <div style={{
            position: 'absolute',
            top: '0.4%',
            right: '0.4%'
        }}>
            <div>
                <i
                    className="material-icons right"
                    title={title}
                    style={{ cursor: 'pointer', color: 'red' }}
                    onClick={() => close(null, name, closeFiles)}>
                    close
                        </i>
            </div>
        </div>
    )
}