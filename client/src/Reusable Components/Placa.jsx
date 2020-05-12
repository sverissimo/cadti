import React from 'react'

const Placa = props => {
    const { veiculoId, city, placa, onClick, style } = props

    return (
        <div id={veiculoId} onClick={onClick} style={style} className='placaContainer'>
            <div className="placaCity">{city}</div>
            <div className="placaCode">{placa}</div>
        </div>
    )
}

export default Placa