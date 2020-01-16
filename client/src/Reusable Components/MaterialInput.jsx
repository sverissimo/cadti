import React, { Fragment } from 'react'

import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import AutoComplete from '../Utils/autoComplete'

const useStyles = makeStyles(theme => ({

    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,        
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    }
}))

export default function MaterialInput({ handleInput, handleBlur, handleCheck, handleSubmit, form, data }) {

    const classes = useStyles()

    const errorHandler = (el) => {
        const value = data.form[el.field]
        if (el.pattern && value) return data.form[el.field].match(el.pattern) === null
        else if (value > el.max || value < el.min) return true
        else return false
    }

    const helper = (el) => {
        const value = data.form[el.field]

        if (value > el.max || value < el.min) return 'Valor inválido'
        else if (value && value.match(el.pattern) === null) return '✘'
        else if (el.pattern && value && value.match(el.pattern) !== null) return '✓'
        else return undefined
    }

    return form.map((el, i) =>
        <Fragment key={i}>
            <TextField
                name={el.field}
                label={el.label}
                margin={el.margin}
                className={classes.textField}
                onChange={handleInput}
                onBlur={handleBlur}
                type={el.type || ''}
                error={errorHandler(el)}
                helperText={helper(el)}
                select={el.select || false}
                value={data[el.field] || ''}
                disabled={el.disabled || false}
                InputLabelProps={{
                    className: classes.textField,
                    shrink: el.type === 'date' || undefined,
                    style: { fontSize: '0.7rem', fontWeight: 400, color: '#888' }
                }}
                inputProps={{
                    style: {
                        background: el.disabled && data.disable ? '#fff' : '#fafafa',
                        fontSize: '0.9rem', textAlign: 'center', color: '#000', width: el.width || 300, height: '7px'
                    },
                    value: `${data[el.field] || ''}`,
                    list: el.datalist || '',
                    maxLength: el.maxLength || '',
                    minLength: el.minLength || '',
                    max: el.max || '',
                }}
                multiline={el.multiline || false}
                rows={el.rows || null}
                variant={el.variant || 'filled'}
                fullWidth={el.fullWidth || false}
            >
                {el.select === true && el.options.map((opt, i) =>
                    <MenuItem key={i} value={opt}>
                        {opt}
                    </MenuItem>)}
            </TextField>
            {el.autoComplete === true && <AutoComplete
                collection={data[el.collection]}
                datalist={el.datalist}
                value={data[el.field] || ''}
            />
            }
        </Fragment>
    )
}