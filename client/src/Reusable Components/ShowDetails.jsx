import React from 'react'
import moment from 'moment'

import TextField from '@material-ui/core/TextField'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'

import { eForm, sForm, segForm, vForm } from '../Forms/joinForms'

import { cadForm } from '../Forms/cadForm'
import { empresasForm } from '../Forms/empresasForm'
import { sociosForm } from '../Forms/sociosForm'
import { procuradorForm } from '../Forms/procuradorForm'
import { seguroForm } from '../Forms/seguroForm'

export default function ShowDetails({ data, tab, title, header, close }) {

    let { tableData, ...ultimateData } = data,
        formPattern

    //Essa função adiciona novos campos e sobrescreve configurações de design dos formulários utilizados em outras partes do sistema.
    function createFormPattern(form, jForm) {
        let
            updatedForm = [],
            updatedObj,
            joinForm = [...jForm]

        form.forEach(f => {
            joinForm.forEach((jf, i) => {
                if (f.field === jf.field) {
                    updatedObj = Object.assign({}, f, jf)
                    joinForm.splice(i, 1)
                    updatedForm.push(updatedObj)
                }
                else if (!updatedForm.find(el => el.field === f.field)) {
                    updatedForm.push(f)
                }
            })
        })

        updatedForm = updatedForm.concat(joinForm)
        
        return updatedForm
    }

    switch (tab) {
        case 0:
            formPattern = createFormPattern(empresasForm, eForm)
            break;
        case 1:
            formPattern = sociosForm.concat(sForm)
            break;
        case 2:
            formPattern = procuradorForm
            break;
        case 3:
            let { veiculoId, laudoId, tableData, modeloChassiId, modeloCarroceriaId, delegatarioId, vencimentoContrato, delegatarioCompartilhado,
                acessibilidadeId, equipa, ...vData } = data

            ultimateData = vData
            formPattern = cadForm.concat([vForm])
            break;
        case 4:
            formPattern = seguroForm.concat(segForm)
            break;

        default:
            break;
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
            formPattern.forEach(({ field, label, type, width, fullWidth }) => {
                if (key === field) {
                    let obj = {}
                    Object.assign(obj, { field, label, value: ultimateData[key] })
                    if (type) Object.assign(obj, { type })
                    if (width) Object.assign(obj, { width })
                    element.push(obj)
                    obj = {}
                }
            })
        }
    })

    Object.keys(ultimateData).forEach(key => {

        const equal = element.find(el => el.field === key)

        if (!equal && tab === 3)
            element.push({ field: key, label: key, value: ultimateData[key] })
    })

    return (
        <div className="popUpWindow" style={{ left: '20%', right: '20%' }}>
            <h4 className='equipaHeader'>{title} {data[header]}</h4> <hr />
            <div className="checkListContainer" style={{ justifyContent: 'flex-start' }}>
                {
                    element.map(({ field, label, value, type, width }, i) =>
                        <div className="showDetailsItem" style={{ width: width ? width : 150, }} key={i}>
                            <TextField
                                name={field}
                                label={label}
                                value={type === 'date' ? moment(value).format('DD/MM/YYYY') : value || ''}
                                InputLabelProps={{ shrink: true, style: { fontSize: '0.9rem', fontWeight: 500 } }}
                                inputProps={{
                                    style: {
                                        fontSize: '0.7rem',
                                        width: width ? width : 150,
                                        fontColor: '#bbb',
                                        textAlign: 'center'
                                    }
                                }}
                                variant='outlined'
                            />
                        </div>
                    )}
            </div>
            <ClosePopUpButton close={close} />
        </div>
    )
}