import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import './userAuth.scss'
import CustomButton from '../Reusable Components/CustomButton';
import MenuItem from '@material-ui/core/MenuItem';

const UserAuthTemplate = ({ data, handleInput, handleSubmit }) => {
    const { title, form, buttonLabel } = data

    useEffect(() => {
        setTimeout(() => {
            const x = document.getElementById('email')
            if (x)
                x.focus()
        }, 600);
    }, [])

    return (
        <div className='flexColumn login'>
            <h2 className='login__title'>CadTI - Cadastro do Transporte Intermunicipal - Seinfra MG</h2>
            <div className='login__form paper'>
                <header>
                    <h4 className="header2 login__subtitle">{title}</h4>
                </header>
                <section className='flexColumn center'>
                    {form.map(({ name, label, options, type }, i) => (
                        <div className="input" key={i}>
                            <TextField
                                type="text"
                                id={name}
                                name={name}
                                label={label}
                                value={data[name] || ''}
                                onChange={handleInput}
                                type={type || 'text'}
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
                    <p>
                        Ainda não é cadastrado?
                       </p>
                    <p>Esqueceu sua senha?</p>
                </footer>
            </div>
        </div>
    );
};

export default UserAuthTemplate;