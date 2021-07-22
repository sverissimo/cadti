import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import { tableGenerator } from './tableGenerator'
import './aviso.scss'

const Aviso = ({ aviso, close }) => {
    const
        { message, vocativo } = aviso
        , { intro, tableData, tableHeaders, tip, tipPath, footer } = message


    const table = tableGenerator(tableData, tableHeaders)
        .replace(/<th>/g, '<th class= "aviso__th">')
        .replace(/<td>/g, '<th class= "aviso__td">')

    return (
        <div className="popUpWindow aviso__body" style={{ left: '20%', right: '20%' }}>
            <h3 className='aviso__title'>
                A/C {vocativo}:
            </h3>
            <br />
            <p>
                {intro}
            </p>
            <br />
            <table className='aviso__table' dangerouslySetInnerHTML={{ __html: table }} />

            <br />
            <p>
                {tip}, acesse {tipPath}
            </p>
            {footer}
            <ClosePopUpButton close={close} />
        </div>

    )
}

export default Aviso
