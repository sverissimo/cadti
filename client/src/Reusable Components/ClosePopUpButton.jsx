import React from 'react'

export default function ClosePopUpButton({close}) {
    return (
        <div style={{
            position: 'absolute',
            top: '0.4%',
            right: '0.4%'
        }}>
            <div>
                <i className="material-icons right" title="Fechar" style={{ cursor: 'pointer', color: 'red' }} onClick={close}>close</i>
            </div>
        </div>
    )
}
