import React, { Fragment } from 'react';
import signUpForm from './signUpForm'
import UserAuth from './UserAuth';
import TextField from '@material-ui/core/TextField';
import './userAuth.scss'
import CustomButton from '../Reusable Components/CustomButton';
import MenuItem from '@material-ui/core/MenuItem';

const signupTemplate = ({ data, handleInput, handleSubmit }) => {

    return (
        <>
            <header>
                <h4 className="header2">Cadastro de usuário</h4>
            </header>
            <section className="flexColumn form paper">
                {signUpForm.map(({ name, label, options }, i) => (
                    <div className="input" key={i}>
                        <TextField
                            type="text"
                            name={name}
                            label={label}
                            value={data[name] || ''}
                            onChange={handleInput}
                            //variant='outlined'
                            //inputProps={{ className: 'tst' }}
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
                <CustomButton label='Cadastrar' onClick={handleSubmit} />
            </section>
        </>
    );
};

export default signupTemplate;