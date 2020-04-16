import React from 'react'

export default function StandardTable({ length, title, labels, values, style }) {
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
                            {v}
                        </td>
                    )}
                </tr>
            </tbody>
        </table>
    )
}
