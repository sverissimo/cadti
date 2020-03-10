import React from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import formatDate from '../Utils/formatDate'
import { cadForm } from '../Forms/cadForm'
import { empresasForm } from '../Forms/empresasForm'
import { sociosForm } from '../Forms/sociosForm'
import { procuradorForm } from '../Forms/procuradorForm'
import { seguroForm } from '../Forms/seguroForm'

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

    let { tableData, ...ultimateData } = data,
        formPattern = empresasForm
    if (tab === 1) formPattern = sociosForm
    if (tab === 2) formPattern = procuradorForm
    if (tab === 4) formPattern = seguroForm

    if (tab === 3) {
        let { veiculoId, laudoId, tableData, modeloChassiId, modeloCarroceriaId, delegatarioId, ...vData } = data
        vData.dataRegistro = formatDate(data.dataRegistro)
        vData.dataEmissao = formatDate(data.dataEmissao)
        vData.vencimento = formatDate(data.vencimento)
        ultimateData = vData
        formPattern = cadForm
    }
    
    let element = []

    Object.keys(ultimateData).forEach(key => {
        if (tab === 3) {
            formPattern.forEach(form => {
                form.forEach(({ field, label, type }) => {
                    if (key === field) {
                        let obj = {}
                        Object.assign(obj, { field, label, value: ultimateData[key] })
                        if (type) Object.assign(obj, { type })
                        element.push(obj)
                        obj = {}
                    }
                })
            })
        } else {
            formPattern.forEach(({ field, label, type }) => {
                if (key === field) {
                    let obj = {}
                    Object.assign(obj, { field, label, value: ultimateData[key] })
                    if (type) Object.assign(obj, { type })
                    element.push(obj)
                    obj = {}
                }
            })
        }
    })

    Object.keys(ultimateData).forEach(key => {
        const equal = element.find(el => el.field === key)
        if (!equal) element.push({ field: key, label: key, value: ultimateData[key] })
    })

    return <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="baseline"
    >
        {
            element.map(({ field, label, value, type }, i) => <Grid key={i} item xs={6} sm={4} md={3} lg={2}>
                <TextField
                    className={textField}
                    name={field}
                    label={label}
                    value={type === 'date' ? formatDate(value) : value || ''}
                    InputLabelProps={{ shrink: true, style: { fontSize: '0.9rem', fontWeight: 500 } }}
                    inputProps={{ style: { fontSize: '0.7rem' } }}
                    variant='outlined'
                />
            </Grid>
            )}
    </Grid>
}
