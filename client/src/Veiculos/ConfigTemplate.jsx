import React, { Fragment } from 'react'

import Crumbs from '../Utils/Crumbs'
import MenuItem from '@material-ui/core/MenuItem'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Add from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import './config.css'


const useStyles = makeStyles(theme => ({

    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: '2px',        
        width: '275px',
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    select: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),        
        marginBottom: '2px',
        background: '#fafafa',
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    }
}))

export default function ConfigTemplate({ collections, collection, data, staticData,
    selectCollection, handleChange, enableEdit, confirmDelete, handleSubmit, openAddDialog }) {

    const
        classes = useStyles(),
        { textField } = classes

    return (
        <Fragment>
           <Crumbs links={['Veículos', '/veiculos']} text='Alterar configurações de veículos' />
            <center>
                <h4>Selecione uma das opções abaixo.</h4>
            </center>
            <div className="selectHeader">
                <TextField
                    className={textField}
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
            </div>
           {staticData && collection && <div className='divHeader'>
                <Button
                    size="small"
                    color='primary'
                    variant='outlined'
                    //  className={classes.button}
                    style={{ margin: '10px 0 10px 0' }}
                    onClick={() => openAddDialog()}
                >
                    <Add /> Adicionar
                </Button>
            </div>}
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
                                className={textField}
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
                    )}
            </div>
            {
                data &&
                <Grid container direction="row" justify='flex-end' >
                    <Grid item xs={1} style={{ align: "right", margin: '20px 95px 10px 0' }}>
                        <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            title='Salvar'
                            onClick={() => handleSubmit()}
                        >
                            Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                        </Button>
                    </Grid>
                </Grid>
            }
        </Fragment >
    )
}