import React, { Fragment } from 'react'

import MenuItem from '@material-ui/core/MenuItem'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import './config.css'


const useStyles = makeStyles(theme => ({

    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: '2px',
        marginBottom: '2px',
        width: '275px',
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    select: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: '2px',
        marginBottom: '2px',
        background: '#fafafa',
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    },
    iconButton: {
        //marginTop: '17px',
        padding: '6px 0px'
    },
    addButton: {
        marginBottom: '1%',
        padding: '1% 0'
    },

}))

export default function ConfigTemplate({ collections, collection, data, staticData,
    selectCollection, handleChange, enableEdit, removeItem, handleSubmit }) {

    const
        classes = useStyles(),
        { iconButton, textField, addButton } = classes

    return (
        <Fragment>
            <h2>Selecione uma das opções abaixo.</h2>
            <TextField
                className={textField}
                onChange={selectCollection}
                value={collection}
                select={true}
                SelectProps={{
                    style: {
                        //background: el.disabled && data.disable ? '#fff' : '#fafafa',
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

            {data && staticData &&
                <Fragment>
                    <h4> {staticData.label}</h4>
                    <div className='container'>
                        {data.map((el, i) =>
                            <div className='divCell' key={i}>
                                <TextField
                                    value={el[staticData.field] + ' (' + el['count'] + ')'}
                                    onChange={handleChange}
                                    inputProps={{
                                        name: el.id
                                    }}
                                    disabled
                                    className={textField}
                                    // disabled={e.field === 'cpfSocio' ? true : s.edit ? false : true}                                
                                    //InputLabelProps={{ shrink: true, style: { fontWeight: 600 } }}
                                    inputProps={{ style: { fontSize: '0.8rem', color: '#000' } }}
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
                                    onClick={() => removeItem(i)}>
                                    <DeleteIcon className='confIcon' color='secondary' />
                                </button>


                            </div>
                        )}
                    </div>
                </Fragment>
            }
            <Grid container direction="row" justify='flex-end' style={{ width: '1200px' }}>
                <Grid item xs={10} style={{ width: '1000px' }}></Grid>
                <Grid item xs={1} style={{ align: "right" }}>
                    <Button
                        size="small"
                        color="primary"
                        variant="contained"
                        style={{ margin: '0px 0 10px 0' }}
                        onClick={() => handleSubmit()}
                    >
                        Salvar <span>&nbsp;&nbsp; </span> <SaveIcon />
                    </Button>
                </Grid>
            </Grid>
        </Fragment >
    )
}


{/* <div>
                            <TextField
                                key={i}
                                value={el[staticData.field]}
                                onChange={handleChange}
                                inputProps={{
                                    name: el.id
                                }}
                            />
                            <span> {el.count}</span>
                        </div> */}