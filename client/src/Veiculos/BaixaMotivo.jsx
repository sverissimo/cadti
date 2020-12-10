import React from 'react'

import TextField from '@material-ui/core/TextField'
import AutoComplete from '../Utils/autoComplete'
import Grid from '@material-ui/core/Grid'

import Button from '@material-ui/core/Button'
import { Send } from '@material-ui/icons'
import { MenuItem } from '@material-ui/core'

export default function BaixaOptions({ motivosBaixa, empresas, selectMotivo, selectedMotivo, demand, delegaTransf,
    handleInput, handleBlur, handleSubmit }) {

    return (
        <>
            <div className="flexColumn">
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
            </div>
            {
                false &&
                <Grid item xs={6} >
                    <TextField
                        inputProps={{
                            list: 'razaoSocial',
                            name: 'delegaTransf',
                        }}
                        value={delegaTransf}
                        onChange={handleInput}
                        onBlur={handleBlur}
                        label='Informe o delegatário para o qual foi transferido o veículo.'
                        fullWidth
                    />
                    <AutoComplete
                        collection={empresas}
                        datalist='razaoSocial'
                        value={delegaTransf}
                    />
                </Grid>
            }
            <div className="flexEnd">
                <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    style={{ margin: '10px 0 10px 0' }}
                    onClick={() => handleSubmit()}
                >
                    Confirmar <span>&nbsp;&nbsp; </span> <Send />
                </Button>
            </div>
            {
                false &&
                <Grid item xs={6} >
                    <TextField
                        inputProps={{
                            list: 'razaoSocial',
                            name: 'delegaTransf',
                        }}
                        value={delegaTransf}
                        onChange={handleInput}
                        onBlur={handleBlur}
                        label='Informe o delegatário para o qual foi transferido o veículo.'
                        fullWidth
                    />
                    <AutoComplete
                        collection={empresas}
                        datalist='razaoSocial'
                        value={delegaTransf}
                    />
                </Grid>
            }
        </>
    )
}
