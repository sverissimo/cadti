import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import avisoInputs from './avisoInputs'
import './newAviso.scss'
import TextField from '@material-ui/core/TextField'
import ReactQuill from 'react-quill'
import EditorToolbar, { modules, formats } from "./EditorToolbar";
import CustomButton2 from '../Reusable Components/CustomButton2'
import AutoComplete from '../Utils/autoComplete'

/* const useStyles = makeStyles(theme => ({
    textField: {
        width: '100%'
    },
}))
 */
//import styles from './avisos.module.scss'

const NewAviso = ({ data, empresas, handleChange, toggleNewAviso, handleSubmit }) => {


    return (
        <div className='newAviso__container'>
            <header className="newAviso__bar">
                <span className='newAviso__bar__title'>
                    Novo aviso
                </span>
                <ClosePopUpButton
                    close={toggleNewAviso}
                />
            </header>
            <section className='avisoInputs__container'>
                {avisoInputs.map(({ field, label, autoComplete, collection, itemProp, disabled }, i) =>
                    <div key={i} className='avisoInputs__inputDiv'>
                        <TextField
                            name={field}
                            label={label}
                            onChange={handleChange}
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
                                list: field || '',
                                autoComplete: 'off'
                            }}
                            variant='filled'
                        />
                        {
                            autoComplete &&
                            <AutoComplete
                                field={field}
                                collection={data[collection] || empresas}
                                itemProp={itemProp}
                                value={data[field] || ''}
                            />
                        }
                    </div>
                )}
            </section>

            <section className='textEditor__container'>
                <div className="textEditor__wrapper">
                    <EditorToolbar />
                    <ReactQuill
                        theme='snow'
                        className='textEditor__editor'
                        onChange={handleChange}
                        //className={textField}
                        name='avisoText'
                        value={data.avisoText || ''}
                        //placeholder={"Escrever aviso..."}
                        modules={modules}
                        formats={formats}
                    />
                </div>
            </section>
            <footer className='newAviso__footer'>
                <CustomButton2
                    label='enviar'
                    iconName='send'
                    style={{ marginTop: '0.5rem' }}
                    onClick={handleSubmit}
                />
            </footer>
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
