import React, { Fragment } from 'react'

import MenuItem from '@material-ui/core/MenuItem'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'




const useStyles = makeStyles(theme => ({

    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: '2px',
        marginBottom: '2px',

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
    helperText: {
        margin: '2px 0',
        fontSize: '0.7rem'
    },
}))


export default function ConfigTemplate({ collections, collection, data, staticData,
    selectCollection, handleChange }) {

    console.log(data)

    return (
        <Fragment>
            <h2>Selecione uma das opções abaixo.</h2>
            <TextField
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
                <div>
                    <h4> {staticData.label}</h4>
                    {data.map((el, i) =>
                        <TextField
                            key={i}                            
                            value={el[staticData.field]}
                            onChange={handleChange}
                            inputProps={{
                                name: el.id
                            }}
                        />
                    )}
                </div>}
        </Fragment>
    )
}




//<div>id: {el.id}, {data.label}: {el[data.field]}</div>

