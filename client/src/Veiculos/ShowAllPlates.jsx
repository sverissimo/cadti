import React from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
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
                                value={item}
                                onChange={() => handleCheck(item)} />
                        }
                        label={<p className="checkListItem">{item}</p>}
                    />
                </span>
            )
            }
            <div style={{
                position: 'absolute',
                top: '0.4%',
                right: '0.4%'
            }}>
                <div>
                    <i className="material-icons right" title="Fechar" style={{ cursor: 'pointer', color: 'red' }} onClick={close}>close</i>
                </div>
            </div>
        </div>
    )
}