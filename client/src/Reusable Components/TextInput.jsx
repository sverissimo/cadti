import React, { Fragment } from 'react'

import MenuItem from '@material-ui/core/MenuItem'
import AutoComplete from '../Utils/autoComplete'
//import { clearFormat } from '../Utils/formatValues'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

const useStyles = makeStyles(theme => ({

    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: '1px',
        marginBottom: '1px',

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

export default function TextInput({ handleInput, handleBlur, form, data, empresas, compartilhados, seguros, seguradoras, selectOptions, disableAll, style = {}, disableSome = [] }) {
    //console.log("🚀 ~ file: TextInput.jsx ~ line 39 ~ TextInput ~ data", data)

    const
        reduxData = { compartilhados, empresas, seguros, seguradoras },
        classes = useStyles(),
        { helperText } = classes

    const errorHandler = (el) => {
        let value = data[el.field]
        if (!value) return

        if (el.errorHandler && el.errorHandler(value)) return false
        else if (value && el.errorHandler && !el.errorHandler(value)) return true

        if (value?.length < el?.minLength) return true

        if (el.type === 'number') {
            if (value > el.max || value < el.min) return true
            else return false
        }

        if (typeof value !== 'string') value = value.toString()
        if (el.pattern) return value.match(el.pattern) === null
        else return false
    }

    const helper = (el) => {
        let value = data[el.field]
        if (!value) return ' '
        if (el.errorHandler && el.errorHandler(value)) return '✓'
        else if (value && el.errorHandler && !el.errorHandler(value)) return '✘'

        if (value?.length < el?.minLength) return '✘'
        if (value?.length >= el?.minLength) return '✓'

        if (typeof value !== 'string') value = value.toString()
        if (value > el.max || value < el.min) return 'Valor inválido'
        else if (value.match(el.pattern) === null) return '✘'
        else if (el.pattern && value.match(el.pattern) !== null) return '✓'
        else return ' '
    }

    return (
        <div className='flex center' style={{ ...style }}>
            {
                form.map((el, i) => (
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
                            FormHelperTextProps={{ className: helperText }}
                            select={el.select || false}
                            value={data[el.field] || ''}
                            disabled={el.disabled || disableAll || disableSome.includes(el.field) || false}
                            InputLabelProps={{
                                className: classes.textField,
                                shrink: el.type === 'date' || undefined,
                                style: { fontSize: '0.7rem', fontWeight: 400, color: '#888', fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif' }
                            }}
                            inputProps={{
                                style: {
                                    background: el.disabled && data.disable ? '#fff' : '#fafafa',
                                    fontSize: '0.85rem', textAlign: 'center', color: '#000', width: el.width || 300, height: '7px',
                                    fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif'
                                },
                                value: `${data[el.field] || ''}`,
                                list: el.field || el.itemProp || '',
                                maxLength: el.maxLength || '',
                                minLength: el.minLength || '',
                                max: el.max || '',
                                autoComplete: 'off'
                            }}

                            multiline={el.multiline || false}
                            minRows={el.rows || null}
                            variant={el.variant || 'filled'}
                            fullWidth={el.fullWidth || false}
                            SelectProps={{
                                style: {
                                    background: el.disabled && data.disable ? '#fff' : '#fafafa',
                                    fontSize: '0.9rem', textAlign: 'center', color: '#555', fontWeight: 400,
                                    width: 325, height: '44px'
                                }
                            }}
                        >
                            {el.select === true ?
                                selectOptions ?
                                    selectOptions.map((opt, i) =>
                                        <MenuItem key={i} value={opt} >
                                            {opt}
                                        </MenuItem>
                                    )
                                    :
                                    el.options.map((opt, i) =>
                                        <MenuItem key={i} value={opt} >
                                            {opt}
                                        </MenuItem>
                                    )
                                : null
                            }

                        </TextField>
                        {el.autoComplete === true && <AutoComplete
                            field={el.field}
                            collection={data[el.collection] || reduxData[el.collection]}
                            itemProp={el.itemProp}
                            value={data[el.field] || ''}
                        />
                        }
                    </Fragment>
                ))
            }
        </div>

    )
}