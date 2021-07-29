import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import './userAuth.scss'
import CustomButton from '../Reusable Components/CustomButton';
import MenuItem from '@material-ui/core/MenuItem';
import { SuggestedBrowsers } from "./SuggestedBrowsers";

const UserAuthTemplate = ({ data, changeTab, handleInput, handleSubmit }) => {
    const { title, form, buttonLabel, tab } = data

    useEffect(() => {
        setTimeout(() => {
            const x = document.getElementById('email')
            if (x)
                x.focus()
        }, 600);
    }, [])

    const errorHandler = (el) => {
        let value = data[el?.field]
        if (!value) return

        if (el.errorHandler && el.errorHandler(value)) return false
        else if (value && el.errorHandler && !el.errorHandler(value)) return true

        if (value?.length < el?.minLength) return true

        if (typeof value !== 'string') value = value.toString()
        if (el.pattern) return value.match(el.pattern) === null
        else return false

    }

    const helper = (el) => {
        let value = data[el.field]
        if (!value) return ' '
        if (el.errorHandler && el.errorHandler(value)) return '✓'
        else if (value && el.errorHandler && !el.errorHandler(value)) return '✘'

        if (value?.length < el?.minLength) return '✘'
        if (value?.length >= el?.minLength) return '✓'

        if (typeof value !== 'string') value = value.toString()
        if (value > el.max || value < el.min) return 'Valor inválido'
        else if (value.match(el.pattern) === null) return '✘'
        else if (el.pattern && value.match(el.pattern) !== null) return '✓'
        else return ' '
    }

    return (
        <div className='flexColumn login'>
            <h2 className='login__title'>CadTI - Cadastro do Transporte Intermunicipal - Seinfra MG</h2>
            <div className='login__form paper'>
                <header>
                    <h4 className="header2 login__subtitle">{title}</h4>
                    {tab === 2 &&
                        <h5 className='login__subtitle--forgotPassword'>
                            Insira o e-mail cadastrado para recuperar a senha.
                        </h5>}
                </header>
                <section className='flexColumn center'>
                    {form.map(({ name, label, options, type = 'text', ...el }, i) => (
                        <div className="input" key={i}>
                            <TextField
                                id={name}
                                name={name}
                                label={label}
                                value={data[name] || ''}
                                onChange={handleInput}
                                type={type}
                                error={errorHandler(el)}
                                helperText={helper(el)}
                                InputProps={{ style: { width: '260px' } }}
                                InputLabelProps={{ style: { fontSize: '10pt', color: '#223' } }}
                                select={options ? true : false}
                            >
                                {options &&
                                    options.map(({ optionLabel, optionValue }, i) =>
                                        <MenuItem key={i} value={optionValue}>
                                            {optionLabel}
                                        </MenuItem>
                                    )
                                }
                            </TextField>
                        </div>
                    ))}
                    <CustomButton label={buttonLabel} onClick={handleSubmit} />
                </section>
                <footer className="login__footer">
                    <p onClick={() => tab === 0 ? changeTab(1) : changeTab(0)}>
                        {tab === 0 ? 'Ainda não é cadastrado?' : 'Voltar para a tela de login'}
                    </p>
                    {
                        tab === 0 &&
                        <p onClick={() => changeTab(2)}>
                            Esqueceu sua senha?
                        </p>
                    }
                </footer>
            </div>
            <SuggestedBrowsers />
        </div>
    );
};

export default UserAuthTemplate;