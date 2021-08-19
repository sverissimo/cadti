import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import avisoInputs from './avisoInputs'
import './newAviso.scss'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
//import TextArea from '../Reusable Components/TextArea'
import ReactQuill from 'react-quill'

const useStyles = makeStyles(theme => ({
    textField: {
        width: '100%'
    },
}))

//import styles from './avisos.module.scss'

const NewAviso = ({ data, handleChange, toggleNewAviso }) => {
    const { textField } = useStyles()

    return (
        <div className='container'>
            <header className="Zbar">
                <span className='Zbar__title'>
                    Novo aviso
                </span>
                <ClosePopUpButton
                    close={toggleNewAviso}
                />
            </header>
            <section className='avisoInputs__container'>
                {avisoInputs.map(({ field, label, disabled }, i) =>
                    <div key={i} className='avisoInputs__inputDiv'>
                        {/*  <span>
                            {label}
                        </span>
                        <input
                            type="text"
                            id={i}
                            name={field}
                            label={label}
                            value={data[field]}
                            onChange={handleChange}
                            disabled={disabled}
                        /> */}

                        <TextField
                            name={field}
                            label={label}
                            onChange={handleChange}
                            //className={textField}
                            className='fk'
                            value={data[field] || ''}
                            disabled={disabled}
                            InputLabelProps={{

                                style: {
                                    fontSize: '0.7rem',
                                    fontWeight: 400,
                                    width: '100%',
                                    color: '#888', fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif'
                                }
                            }}
                            inputProps={{
                                style: {
                                    background: disabled && data.disable ? '#fff' : '#fafafa',
                                    fontSize: '0.85rem', color: '#000',
                                    width: '100%',
                                    height: '7px',
                                    fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif'
                                },
                                autoComplete: 'off'
                            }}
                            variant='filled'

                        />
                    </div>
                )}
            </section>
            <section>

                <ReactQuill
                    className='fk2'
                    onChange={handleChange}
                    //className={textField}
                    name='avisoText'
                    value={data.avisoText || ''}
                />
            </section>
            {/* <section className='flexColumn avisos__Text'>
                <TextArea
                    id='avisoText'
                    label='Mensagem'
                />

            </section> */}
        </div>
    )
}

export default NewAviso
