import React from 'react'

import TextField from '@material-ui/core/TextField'
import { MenuItem } from '@material-ui/core'

export default function BaixaOptions({ motivosBaixa, selectMotivo, selectedMotivo, demand }) {

    return (
        <>
            <div className="flexColumn">
                {
                    !demand && <>
                        <h3>Selecione o motivo da baixa</h3>
                        <TextField
                            className='config__selector'
                            onChange={selectMotivo}
                            name='selectedOption'
                            value={selectedMotivo || ''}
                            select={true}
                            placeholder='Clique para selecionar...'
                            SelectProps={{
                                style: {
                                    fontSize: '0.9rem', color: '#555', fontWeight: 400,
                                    width: 325, height: '44px'
                                }
                            }}
                        >
                            {motivosBaixa.map((opt, i) =>
                                <MenuItem key={i} value={opt} >
                                    {opt}
                                </MenuItem>
                            )}
                        </TextField>
                    </>
                }
            </div>
        </>
    )
}
