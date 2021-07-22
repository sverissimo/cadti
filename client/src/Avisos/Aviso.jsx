import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'

const Aviso = ({ aviso, close }) => {
    const
        { message, vocativo } = aviso
        , { header, intro, table, tip, tipPath, footer } = message
        , linkParaCadTI = 'whatever'
    return (
        <div className="popUpWindow" style={{ left: '20%', right: '20%' }}>
            {header}

            <h3>
                A/C {vocativo}:
            </h3>
            <p>
                {intro}
            </p>
            <br />
            {/* <table>
                {table}
            </table> */}
            <br />
            <p>
                {tip}, acesse {linkParaCadTI} na opção {tipPath}
            </p>
            {footer}
            <ClosePopUpButton close={close} />
        </div>

    )
}

export default Aviso
