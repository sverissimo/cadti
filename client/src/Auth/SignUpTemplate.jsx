import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import './userAuth.scss'
import CustomButton from '../Reusable Components/CustomButton';
import MenuItem from '@material-ui/core/MenuItem';

const SignupTemplate = ({ data, handleInput, handleSubmit }) => {
    const { title, form, buttonLabel, errorMessage } = data

    useEffect(() => {
        setTimeout(() => {
            const x = document.getElementById('email')
            if (x)
                x.focus()
        }, 600);
    }, [])

    return (
        <>
            <header>
                <h4 className="header2">{title}</h4>
            </header>
            <section className="flexColumn form paper">
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
                            InputProps={{ style: { width: '400px' } }}
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
                {
                    errorMessage &&
                    <h3>{errorMessage}</h3>
                }
            </section>
        </>
    );
};

export default SignupTemplate;