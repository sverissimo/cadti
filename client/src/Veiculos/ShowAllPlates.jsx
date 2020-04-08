import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import '../Layouts/popUp.css'

function ShowAllPlates({ items, title, data, close, handleCheck }) {
    return (
        <div className="popUpWindow row">
            <h3>{title} Clique em "X" ou pressione 'esc' para voltar</h3>
            <div className="checkListContainer">
                {
                    items.map((item, i) =>
                        <div className="checkListItem" key={i}>
                            <input
                                id={i}
                                type='checkbox'
                                checked={data[item] === true}
                                onChange={() => handleCheck(item)} />
                            <label htmlFor={i}>{item}</label>
                        </div>
                    )
                }
            </div>
            <ClosePopUpButton close={close} />
        </div>
    )
}

export default ShowAllPlates
