import React from 'react'
import { TextField, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import formatDate from '../Utils/formatDate'
import {cadForm} from '../Forms/cadForm'

const useStyles = makeStyles(theme => ({
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: '9%',
        width: 150,
        fontSize: '0.6rem',
        fontColor: '#bbb',
        textAlign: 'center'
    }
}))

export default function VehicleDetails({ data, tab }) {
    const classes = useStyles(), { textField } = classes
    
    let { veiculoId, laudoId, tableData, modeloChassiId, modeloCarroceriaId, delegatarioId, ...vData } = data
        
    if (tab === 0) {
        vData.dataRegistro = formatDate(data.dataRegistro)
        vData.dataEmissao = formatDate(data.dataEmissao)
        vData.vencimento = formatDate(data.vencimento) 
    }
    
    let vehicle = []
    let label
    Object.entries(vData).forEach(([k, v]) => {
        label = cadForm[0].find(e=> e.field === k)
        if(label === undefined) label = cadForm[1].find(e=> e.field === k)
        if(label === undefined) label = cadForm[2].find(e=> e.field === k)
        if(label !== undefined) label = vehicle.push([label.label, v])        
        else vehicle.push([k, v])
        
    })

    return <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="baseline"
    >
        {
            vehicle.map((v, i) => <Grid key={i} item xs={6} sm={4} md={3} lg={2}>

                <TextField
                    className={textField}
                    label={v[0]}
                    value={v[1] || ''}
                    InputLabelProps={{ shrink: true, style: { fontSize: '0.9rem', fontWeight: 500 } }}
                    inputProps={{ style: { fontSize: '0.7rem' } }}
                    variant='outlined'
                />
            </Grid>

            )
        }
    </Grid>
}
