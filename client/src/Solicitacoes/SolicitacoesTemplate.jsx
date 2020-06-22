import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

export default function SolicitacoesTemplate({ completed, showCompleted }) {
    return (
        <header style={{ display:'flex', justifyContent: 'flex-end', height: '50px', paddingBotom: '10px' }}>
            <FormControlLabel
                style={{ marginTop: '20px' }}
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
