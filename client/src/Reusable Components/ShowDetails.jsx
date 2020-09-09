import React from 'react'
import moment from 'moment'

import TextField from '@material-ui/core/TextField'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import createFormPattern from '../Utils/createFormPattern'

export default function ShowDetails({ data, tab, title, header, close }) {

    const element = createFormPattern(tab, data) || []

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