import React from 'react'
import moment from 'moment'
import downloadFile from '../Utils/downloadFile'
import DeleteIcon from '@material-ui/icons/Delete';

export default function StandardTable({ table, length, title, style, idIndex = 0, filePK, deleteIconProperties = {}, deleteFunction }) {
    const { tableHeaders, arrayOfRows, docs } = table

    const dateFormat = value => {
        if (moment(value, 'YYYY-MM-DDTHH:mm:ss.SSSZZ', true).isValid()) {
            return moment(value, moment.ISO_8601, true).format('DD/MM/YYYY')
        }
        else {
            return value
        }
    }

    const getFile = id => {
        const file = docs.find(f => f.id === id)
        if (id && file) downloadFile(file.id, file.filename, 'vehicleDocs', file.metadata.fieldName);
    }
    console.log(arrayOfRows)
    return (
        <table>
            <thead>
                <tr>
                    <th className='tHeader'
                        style={style}
                        colSpan={length}>{title}</th>
                </tr>
                <tr>
                    {tableHeaders.map((l, i) => <th key={i} style={style}>{l}</th>)}
                </tr>
            </thead>
            <tbody>
                {
                    arrayOfRows.map((el, j) =>
                        <tr key={j}>
                            {
                                el.map((obj, i) =>
                                    <td key={i} style={style} className={obj.type === 'link' && obj.fileId ? 'link2' : 'review'}
                                        onClick={
                                            () => obj.field === filePK && obj.fileId ? getFile(obj.fileId)
                                                : obj?.action === 'delete' ? deleteFunction(el[idIndex]?.value)
                                                    : null}>
                                        {
                                            obj.type === 'date' ? dateFormat(obj.value)
                                                : obj?.action === 'delete' && el[idIndex]?.value ? <DeleteIcon {...deleteIconProperties} />
                                                    : obj.value
                                        }
                                    </td>
                                )}
                        </tr>
                    )}
            </tbody>
        </table>
    )
}
