import React from 'react'
import moment from 'moment'

export default function StandardTable({ length, title, labels, values, style }) {

    const dateFormat = value => {
        if (moment.utc(value).isValid()) {
            return moment(value).format('DD/MM/YYYY')

        }
        else {
            console.log(value)
            return value
        }
    }

    return (
        <table>
            <thead>
                <tr>
                    <th className='tHeader'
                        style={style ? style : null}
                        colSpan={length}>{title}</th>
                </tr>
                <tr>
                    {labels.map((l, i) => <th key={i}>{l}</th>)}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {values.map((v, j) =>
                        <td className='review' key={j}>
                            {dateFormat(v)}
                        </td>
                    )}
                </tr>
            </tbody>
        </table>
    )
}
