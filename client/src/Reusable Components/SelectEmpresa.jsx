import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import AutoComplete from '../Utils/autoComplete'

import './commonStyles.css'

const useStyles = makeStyles(theme => ({

    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(1),
        minWidth: '700px'
    }
}));

export default function SelectEmpresa(props) {

    const
        { empresas, handleInput, handleBlur } = props,
        { razaoSocial } = props.data,
        classes = useStyles(), { paper } = classes

    return (
        <div className='selectEmpresa'>
            <Paper className={paper} style={{ padding: '0 2% 0 2%' }}>
                <div className='item'>
                    <h3>  Selecione a Viação </h3>
                    <input
                        list='razaoSocial'
                        name='razaoSocial'
                        className='selectEmpresa'
                        value={razaoSocial}
                        onChange={handleInput}
                        onBlur={handleBlur}
                    />
                    <AutoComplete
                        style={{ textAlign: 'center', width: '500px' }}
                        collection={empresas}
                        datalist='razaoSocial'
                        value={razaoSocial}
                    />
                </div>
            </Paper>
        </div>
    )
}
