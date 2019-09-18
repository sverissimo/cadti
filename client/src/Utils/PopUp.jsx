import React from 'react'

export default function PopUp({ close, children, title }) {

    return (
        <div>
            <div className='card z-depth-5'
                style={{
                    position: 'fixed',
                    top: '10%',
                    right: '33%',
                    left: '33%',
                    padding: '5px 0px 7px 20px',
                    borderRadius: '15px',
                    border: '1px solid #aaa',
                    backgroundColor: 'white'
                }}>
                <div className='row'>
                    <div className="center"><h5>{title}</h5></div>
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
