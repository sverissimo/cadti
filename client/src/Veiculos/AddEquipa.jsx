import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import '../Layouts/popUp.css'

export default function AddEquipa({ data, equipamentos, handleCheck, close }) {    
    
    if (Array.isArray(equipamentos) && equipamentos[0]?.item) equipamentos = equipamentos.sort((a, b) => a.item.localeCompare(b.item))

    return <div className='popUpWindow' style={{ right: '25%', left: '25%' }}>
        <h4 className='equipaHeader'>Equipamentos</h4> <hr />
        <div className="checkListContainer">
            {
                equipamentos.map((eq, i) =>
                    <span className="checkListEquipa" key={i}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={data[eq.item]}
                                    value={eq.item}
                                    onChange={() => handleCheck(eq.item)} />
                            }
                            label={<p className="checkListLabel">{eq.item}</p>}
                        />
                    </span>
                )
            }
        </div>
        <ClosePopUpButton close={close} />
    </div>
}
