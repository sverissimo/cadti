import React from 'react'

import Crumbs from '../Reusable Components/Crumbs'
import MenuItem from '@material-ui/core/MenuItem'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save';

import TextInput from '../Reusable Components/TextInput'
import './parametros.scss'

const ParametrosTemplate = ({ data, selectOption, handleInput, handleSubmit }) => {
    const { options, selectedOption, form, modified } = data

    return (
        <div className='paper'>
            <Crumbs links={['Parâmetros', '/parametros']} text='Alterar parâmetros do sistema' />
            <header className="selectHeader">
                <h4 className='parametrosTitle'>Alterar parâmetros do sistema - Selecione uma das opções abaixo.</h4>
                {/* ******************Select box ******************** */}
                <TextField
                    className='config__selector'
                    onChange={selectOption}
                    name='selectedOption'
                    value={selectedOption || ''}
                    select={true}
                    placeholder='Clique para selecionar...'
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
                            disabled={!modified}
                        >
                            Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                        </Button>
                    </div>
                </main>
            }
        </div>
    )
}

export default ParametrosTemplate