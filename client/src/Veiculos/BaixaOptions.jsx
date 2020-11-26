import React from 'react'

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import './baixa.scss'

const options = [
    {
        value: 'baixar',
        label: 'Baixar veículo'
    },
    {
        value: 'gerenciar',
        label: 'Gerenciar veículos baixados'
    }
]

export default function BaixaOptions({ empresas, selectOption, parametros, demand, checked, delegaTransf, justificativa, pendencias, handleInput, handleBlur, handleCheck, handleSubmit }) {
    return (
        <div className="flex center">
            <div className="flexColumn ">
                <h3 className='radio__title' >Selecione uma das opções abaixo</h3>
                <FormControl component="fieldset">
                    <RadioGroup aria-label="position" name="position"
                        onChange={selectOption} row
                        style={{ width: 'auto' }}
                        className='radio'
                    >
                        {
                            options.map(({ value, label }, i) =>
                                <FormControlLabel
                                    key={i}
                                    className='radio'
                                    value={value}
                                    label={<span className='radio__legend'> {label} </span>}
                                    control={<Radio color="primary" />}
                                />
                            )
                        }
                    </RadioGroup>
                </FormControl>
            </div>
        </div>
    )
}
