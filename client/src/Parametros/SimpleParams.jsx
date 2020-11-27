import React from 'react'
import { TextField } from '@material-ui/core'
import AddCircleOutlineSharpIcon from '@material-ui/icons/AddCircleOutlineSharp';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';

//Esse componente renderiza inputs de uma array no estado da aplicação
const SimpleParams = ({ data, handleInput, plusOne, removeOne }) => {

    const state = [...data?.newState] || []

    return (
        <>
            <header>
                <h4 className='singleParams__title'>Clique nos campos abaixo para editar e/ou adicione novos.</h4>
            </header>
            {state.map((m, i) =>
                <section className="singleParams__container" key={i}>
                    <div className="singleParams__rowContainer">
                        <TextField
                            name={i.toString()}
                            value={state[i]}
                            onChange={handleInput}
                            variant='filled'
                            InputProps={{ style: { margin: '8px 0' } }}
                            inputProps={{ style: { width: '300px', textAlign: 'center', fontSize: '10pt', height: '30px', padding: '5px 0' } }}
                        />
                        <div className='singleParams__deleteIcon' title='Remover' onClick={() => removeOne(i)}>
                            <DeleteOutlinedIcon />
                        </div>
                    </div>
                </section>
            )}
            <div className='addIcon'>
                <div
                    className="addIcon__container"
                    onClick={() => plusOne()}
                >
                    <span className="addIcon__text">
                        Adicionar
                    </span>
                    <AddCircleOutlineSharpIcon className='addIcon__icon' />
                </div>
            </div>
        </>
    )
}

export default SimpleParams
