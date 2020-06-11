import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

export default function SolicitacoesTemplate({ completed, showCompleted }) {
    return (
        <header>
            <h3>Minhas solicitações</h3>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={completed === true}
                        onChange={() => showCompleted(!completed)}
                        value={completed}
                    />
                }
                label={<p>Mostrar solicitações concluídas</p>}
            />
        </header>
    )
}
