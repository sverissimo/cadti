import React from 'react'

import Crumbs from '../Reusable Components/Crumbs'
import MenuItem from '@material-ui/core/MenuItem'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save';

import TextInput from '../Reusable Components/TextInput'
import './configuracoes.scss'

const ConfiguracoesTemplate = ({ data, selectOption, handleInput, handleSubmit }) => {
    const { options, selectedOption, form } = data

    return (
        <div className='paper'>
            <Crumbs links={['Configuracoes', '/Configuracoes']} text='Alterar parâmetros do sistema' />
            <header className="selectHeader">
                <h4 className='parametrosTitle'>Alterar parâmetros do sistema - Selecione uma das opções abaixo.</h4>
                {/* ******************Select box ******************** */}
                <TextField
                    className='config__selector'
                    onChange={selectOption}
                    name='selectedOption'
                    value={selectedOption || ''}
                    select={true}
                    SelectProps={{
                        style: {
                            fontSize: '0.9rem', color: '#555', fontWeight: 400,
                            width: 325, height: '44px'
                        }
                    }}
                >
                    {options.map((opt, i) =>
                        <MenuItem key={i} value={opt} >
                            {opt}
                        </MenuItem>
                    )}
                </TextField>
            </header>
            {
                form &&
                <main className='configForm'>
                    <TextInput
                        form={form}
                        data={data}
                        handleInput={handleInput}
                        style={{ width: '100%', flexDirection: 'column' }}
                    />
                    <div style={{ minHeight: '60px', position: 'flex' }}>
                        <Button
                            size="small"
                            color='primary'
                            className='saveButton'
                            variant="contained"
                            onClick={() => handleSubmit()}
                        //disabled={!renderedPlacas[0] || !apoliceDoc ? true : false}
                        >
                            Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                        </Button>
                    </div>
                </main>
            }
        </div>
    )
}

export default ConfiguracoesTemplate