import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import '../Layouts/popUp.css'

function ShowAllPlates({ items, title, data, close, selectAll, handleCheck, selectAllPlates }) {

    return (
        <div className="popUpWindow row">
            <h6>{title} Clique em "X" ou pressione 'esc' para voltar</h6>
            <div style={{ margin: '10px 0', fontSize: '0.8rem' }}>
                <input
                    id='all'
                    type='checkbox'
                    checked={selectAll === true}
                    onChange={() => selectAllPlates()} />
                <label htmlFor='all'>{selectAll ? 'Desmarcar todas selecionadas' : 'Selecionar todas'}</label>
            </div>

            <main className="checkListContainer">
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
            </main>
            <ClosePopUpButton close={close} />
        </div>
    )
}

export default ShowAllPlates
