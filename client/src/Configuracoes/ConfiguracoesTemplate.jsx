import React, { Fragment } from 'react'

import Crumbs from '../Reusable Components/Crumbs'
import MenuItem from '@material-ui/core/MenuItem'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Add from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
//import './config.css'

const collections = ['Idade e prazos para baixa', 'Distância mínima entre poltronas']

const ConfiguracoesTemplate = () => {
    return (
        <Fragment>
            <Crumbs links={['Configuracoes', '/Configuracoes']} text='Alterar parâmetros do sistema' />
            <header className="selectHeader">
                <h4>Selecione uma das opções abaixo.</h4>
                <TextField
                    className='config__selector'
                    //onChange={selectCollection}
                    //value={collection}
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
        </Fragment>
    )
}

export default ConfiguracoesTemplate