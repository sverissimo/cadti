import React from 'react'
import TextInput from '../Reusable Components/TextInput'
import SimpleParams from './SimpleParams'
import CheckBoxFilter from '../Reusable Components/CheckBoxFilter';
import CustomButton from '../Reusable Components/CustomButton'

import Crumbs from '../Reusable Components/Crumbs'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import './parametros.scss'

const ParametrosTemplate = ({ data, selectOption, handleInput, handleSubmit, plusOne, removeOne, outsider, toggleChecked }) => {

    const { tab, options, selectedOption, form, modified } = data

    return (
        <>
            {
                !outsider &&
                <header className="selectHeader">
                    <Crumbs links={['Parâmetros', '/parametros']} text='Alteração de parâmetros do sistema' />
                    <h4 className='parametrosTitle'>Alteração de parâmetros do sistema</h4>
                    {/* ******************Select box ******************** */}
                    <TextField
                        className='config__selector'
                        onChange={selectOption}
                        name='selectedOption'
                        value={selectedOption || ''}
                        select={true}
                        label={!selectedOption && 'Selecione uma das opções...'}
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
            }
            {
                form && tab !== 3 &&
                <main className='configForm'>
                    <TextInput
                        form={form}
                        data={data}
                        handleInput={handleInput}
                        style={{ width: '100%', flexDirection: 'column' }}
                    />
                </main>
            }
            {/* Formulário simples que representa uma array de strings no DB / estado local  */}
            {
                tab === 3 &&
                <SimpleParams
                    form={form}
                    data={data}
                    plusOne={plusOne}
                    removeOne={removeOne}
                    handleInput={handleInput}
                    style={{ width: '100%', flexDirection: 'column' }}
                />
            }
            {
                tab === 5 &&
                <div className="flex center">
                    <CheckBoxFilter
                        title='Habilitar validação de campos'
                        checked={data.inputValidation}
                        toggleChecked={toggleChecked}
                    />
                </div>
            }
            {/* Botão de salvar independe do formulário renderizado, desde que alguma opção tenha sido selecionada */}
            {
                selectedOption &&
                <div style={{ minHeight: '60px', position: 'flex' }}>
                    <CustomButton
                        action='save'
                        onClick={handleSubmit}
                        disabled={!modified}
                    />
                </div>
            }
        </>
    )
}

export default ParametrosTemplate