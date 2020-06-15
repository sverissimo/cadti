import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

export default function SolicitacoesTemplate({ completed, showCompleted }) {
    return (
        <header className='flex'>
            <h3>Minhas solicitações</h3>

            <FormControlLabel
                style={{ marginTop: '50px' }}
                control={
                    <Checkbox
                        checked={completed === true}
                        onChange={() => showCompleted(!completed)}
                        value={completed}                        
                    />
                }
                label={<p style={{ color: '#2979ff', fontSize: '0.7rem', float: 'right' }}> Mostrar solicitações concluídas</p>}
            />
        </header>
    )
}
