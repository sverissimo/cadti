import React from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import '../Layouts/popUp.css'

export default function AddEquipa({ title, data, items, handleCheck, close }) {

    return (
        <div className="popUpWindow">
            <h3>{title} Clique em "X" ou pressione 'esc' para voltar</h3>
            {items.map((item, i) =>
                <span className="checkListItem" key={i}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size='small'
                                checked={data[item] === true}
                                onChange={() => handleCheck(item)} />
                        }
                        label={<p className="checkListItem">{item}</p>}
                    />
                </span>
            )
            }
            <ClosePopUpButton close={close} />
        </div>
    )
}