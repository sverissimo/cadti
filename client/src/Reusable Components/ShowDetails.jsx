import React from 'react'
import moment from 'moment'

import TextField from '@material-ui/core/TextField'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import createFormPattern from '../Utils/createFormPattern'
import { razaoSocial } from '../Forms/commonFields'

export default function ShowDetails({ data, tab, title, header, close, empresas, procuracoes, procuradores }) {

    const element = createFormPattern(tab, data) || []

    const additionalInfo = (tab) => {
        if (tab === 0) {
            let selectedProcs = []
            console.log(element)

            const razaoSocial = element.find(el => el.field === 'razaoSocial')?.value
            const delegatarioId = empresas.find(e => e.razaoSocial === razaoSocial)?.delegatarioId
            console.log(delegatarioId)

            const selectedDocs = procuracoes.filter(p => p.delegatarioId === delegatarioId)
            console.log(selectedDocs)
            
            procuradores.forEach(pr => {
                selectedDocs.forEach(doc => {
                    if (doc.procuradores.some(p => p === pr.procuradorId))
                        selectedProcs.push(pr)
                })
            })
            console.log(selectedProcs, procuradores)
        }
    }
    additionalInfo(tab)
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