import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import './aviso.scss'

const CustomAviso = ({ aviso, close }) => {
    const { from, vocativo, message } = aviso

    return (
        <div
            className="popUpWindow aviso__body"
            style={{ left: '20%', right: '20%' }}
        >
            <h3 className='aviso__title'>
                A/C {vocativo}:
            </h3>
            <br />
            <div dangerouslySetInnerHTML={{ __html: message }} >
            </div>
            <br />
            <p>
                Att,
                <br />
                {from}.
            </p>
            <ClosePopUpButton close={close} />
        </div>

    )
}

export default CustomAviso
