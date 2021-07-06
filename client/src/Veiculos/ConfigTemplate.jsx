import React, { Fragment } from 'react'

import Crumbs from '../Reusable Components/Crumbs'
import MenuItem from '@material-ui/core/MenuItem'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Add from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import './config.css'
import Parametros from '../Parametros/Parametros'
import { motivosBaixa } from '../Forms/parametrosForm'

export default function ConfigTemplate({ collections, collection, data, staticData, editMotivosBaixa,
    selectCollection, handleChange, enableEdit, confirmDelete, handleSubmit, openAddDialog }) {

    return (
        <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Alterar configurações de veículos' />
            <center>
                <h4>Selecione uma das opções abaixo.</h4>
            </center>
            <header className="selectHeader">
                <TextField
                    className='config__selector'
                    onChange={selectCollection}
                    value={collection}
                    select={true}
                    SelectProps={{
                        style: {
                            fontSize: '0.9rem', color: '#555', fontWeight: 400,
                            width: 325, height: '44px'
                        }
                    }}
                >
                    {collections.map((opt, i) =>
                        <MenuItem key={i} value={opt} >
                            {opt}
                        </MenuItem>
                    )}
                </TextField>
            </header>
            {staticData && collection && !editMotivosBaixa &&
                <div className='divHeader'>
                    <Button
                        size="small"
                        color='primary'
                        variant='outlined'
                        style={{ margin: '10px 0 10px 0' }}
                        onClick={() => openAddDialog()}
                    >
                        <Add /> Adicionar
                    </Button>
                </div>
            }
            {
                !editMotivosBaixa ?
                    <div className='container'>
                        {
                            data && staticData && data.map((el, i) =>
                                <div className='divCell' key={i}>
                                    <TextField
                                        value={el.edit ? el[staticData.field] : el[staticData.field] + ' (' + el['count'] + ')'}
                                        onChange={handleChange}
                                        name={el.field}
                                        type='text'
                                        inputProps={{
                                            autoCorrect: 'off',
                                            spellCheck: false,
                                            style: {
                                                fontSize: '0.8rem',
                                                color: el.edit === true ? '#000' : '#999'
                                            },
                                        }}
                                        className='config__textField'
                                        disabled={el.edit === false}
                                    />
                                    <button component='span'
                                        className='configVehicleIcon'
                                        title='Editar'
                                        onClick={() => enableEdit(i)}
                                        display='none'>
                                        <EditIcon className='confIcon' color='primary' />
                                    </button>
                                    <button
                                        className='configVehicleIcon'
                                        title='Remover'
                                        onClick={() => confirmDelete(i)}>
                                        <DeleteIcon className='confIcon' color='secondary' />
                                    </button>
                                </div>
                            )
                        }
                    </div>
                    :
                    <Parametros
                        form={motivosBaixa}
                        tab={3}
                        outsider={true} />
            }
        </Fragment >
    )
}