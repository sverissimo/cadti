import React from 'react'

export default function PopUp({ close, children, title, format }) {
    
    return (
        <div>
            <div className='card z-depth-5'
                style={{
                    position: 'fixed',
                    height:'80vh',
                    top: format ? format.top : '10%',
                    right: format ? format.right : '33%',
                    left: format ? format.left : '33%',
                    padding: '5px 0px 7px 20px',
                    borderRadius: '15px',
                    border: '1px solid #aaa',
                    backgroundColor: 'white',
                    zIndex:10,
                    boxShadow: '2px',
                    overflowY: 'auto'
                }}>
                <div className='row'>
                    <div ><h5>{title}</h5></div>
                </div>
                {children}
                <div style={{
                    position: 'absolute',
                    top: '0.4%',
                    right: '0.4%'
                }}>
                    <div>
                        <i className="material-icons right" title="Fechar" style={{ cursor: 'pointer', color: 'red' }} onClick={close}>close</i>
                    </div>
                </div>
            </div >
        </div >
    )
}
