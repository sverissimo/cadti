import React from 'react'

const CertificateHeader = ({ nomes }) => {

    const { secretaria, subsecretaria, superintendencia } = nomes
    return (
        <>
            <div className="certHeader__container">
                <div className="certHeader__brasao">
                    <img src="/images/brasao.png" alt="Brasão de Minas Gerais" className='certHeader__img' />
                </div>
                <div className="certHeader__text">
                    <p>{secretaria}</p>
                    <p>{subsecretaria}</p>
                    <p>{superintendencia}</p>
                    <h2>Certificado de Registro e Seguro</h2>
                </div>
            </div>
        </>
    )
}

export default CertificateHeader 