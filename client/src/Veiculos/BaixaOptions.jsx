import React from 'react'

import TextField from '@material-ui/core/TextField'
import AutoComplete from '../Utils/autoComplete'
import Grid from '@material-ui/core/Grid'

import Button from '@material-ui/core/Button'
import { Send } from '@material-ui/icons'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export default function BaixaOptions({ empresas, demand, checked, delegaTransf, justificativa, handleInput, handleBlur, handleCheck, handleSubmit }) {

    const checkOptions = () => {

        const radioAttempt = [
            {
                value: 'venda',
                label: 'Venda para outra empresa do sistema'
            },
            {
                value: 'outro',
                label: 'Outro'
            }
        ]


        if (!demand) return radioAttempt
    }

    const formControl = checkOptions()
    return (
        <>
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="center"
                style={{ width: checked === 'venda' || checked === 'outro' ? '1200px' : '600px', marginTop: '25px' }}
            >
                <Grid item xs={checked ? 6 : 12}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Motivo da baixa</FormLabel>
                        <RadioGroup aria-label="position" name="position"
                            onChange={handleCheck} row
                            style={{ width: 'auto' }}
                            className='radio'
                        >
                            {
                                formControl.map(({value, label}, i) =>
                                    <FormControlLabel
                                        className='radio'
                                        value={value}
                                        control={<Radio color="primary" />}
                                        label={<span style={{ fontSize: '0.8rem' }}>{label}</span>}
                                        labelPlacement="start"
                                    />
                                )
                            }
{/* 
                            <FormControlLabel
                                className='radio'
                                value="venda"
                                control={<Radio color="primary" />}
                                label={<span style={{ fontSize: '0.8rem' }}>{"Venda para outra empresa do sistema"}</span>}
                                labelPlacement="start"
                            />
                            <FormControlLabel
                                value="outro"
                                control={<Radio color="primary" />}
                                label={<span style={{ fontSize: '0.8rem' }}>{"Outro"}</span>}
                                labelPlacement="start"
                            />

 */}                        </RadioGroup>
                    </FormControl>
                </Grid>

                {checked === 'venda' ?
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
                    :
                    checked === 'outro' &&
                    <Grid item xs={6}>
                        <TextField
                            name='justificativa'
                            value={justificativa}
                            label='Justificativa'
                            type='text'
                            onChange={handleInput}
                            InputLabelProps={{ shrink: true }}
                            multiline
                            rows={3}
                            variant='outlined'
                            fullWidth
                        />
                    </Grid>
                }
            </Grid>
            <Grid container direction="row" justify='flex-end' style={{ width: '1200px' }}>
                <Grid item xs={11} style={{ width: '1000px' }}></Grid>
                <Grid item xs={1} style={{ align: "right" }}>
                    <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        style={{ margin: '10px 0 10px 0' }}
                        onClick={() => handleSubmit()}
                    >
                        Confirmar <span>&nbsp;&nbsp; </span> <Send />
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}
