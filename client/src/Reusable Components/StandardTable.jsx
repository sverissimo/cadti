import React from 'react'
import moment from 'moment'
import downloadFile from '../Utils/downloadFile'

export default function StandardTable({ length, title, labels, fields, values, style, docs, alteredElements = [] }) {

    const dateFormat = value => {
        if (moment(value, 'YYYY-MM-DDTHH:mm:ss.SSSZZ', true).isValid()) {
            return moment(value, moment.ISO_8601, true).format('DD/MM/YYYY')
        }
        else {
            return value
        }
    }
    
    return (
        <table>
            <thead>
                <tr>
                    <th className='tHeader'
                        style={style}
                        colSpan={length}>{title}</th>
                </tr>
                <tr>
                    {labels.map((l, i) => <th key={i} style={style}>{l}</th>)}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {values.map((v, j) =>
                        <td className='review' key={j}
                            style={{ ...style, color: alteredElements.includes(fields[j]) ? 'red' : '#000' }}
                            onClick={() => docs && docs.id ? downloadFile(docs.id, docs.filename, 'vehicleDocs', docs.metadata.fieldName) : null}>
                            {dateFormat(v)}
                        </td>
                    )}
                </tr>
            </tbody>
        </table>
    )
}
