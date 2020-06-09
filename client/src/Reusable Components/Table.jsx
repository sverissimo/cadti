import React from 'react'
import moment from 'moment'
import downloadFile from '../Utils/downloadFile'
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';

export default function StandardTable({ tableData, staticFields, title, style, files, showDetails, idIndex = 0, deleteIconProperties = {}, deleteFunction }) {

    const dateFormat = value => {
        if (moment(value, 'YYYY-MM-DDTHH:mm:ss.SSSZZ', true).isValid()) {
            return moment(value, moment.ISO_8601, true).format('DD/MM/YYYY')
        }
        else {
            return value
        }
    }

    const getFile = id => {
        if (!files) return
        const file = files.find(f => f.id === id)
        if (file) downloadFile(file.id, file.filename, 'vehicleDocs', file.metadata.fieldName);
    }


    let
        tableHeaders = [],
        arrayOfRows = [],
        tableRow = []

    tableData.forEach(log => {
        staticFields.forEach(obj => {

            if (!tableHeaders.includes(obj.title)) tableHeaders.push(obj.title)
            if (obj.field === 'info') tableRow.push({ ...obj, id: log?._id })
            else tableRow.push({ ...obj, value: log[obj.field] })
        })

        arrayOfRows.push(tableRow)
        tableRow = []
    })

    const tableSpan = arrayOfRows[0]?.length || ''

    return (
        <table>
            <thead>
                <tr>
                    <th className='tHeader'
                        style={style}
                        colSpan={tableSpan}>{title}</th>
                </tr>
                <tr>
                    {tableHeaders.map((l, i) => <th key={i} style={style}>{l}</th>)}
                </tr>
            </thead>
            <tbody>
                {
                    arrayOfRows.map((rowArray, j) =>
                        <tr key={j}>
                            {
                                rowArray.map((obj, i) =>
                                    <td key={i} style={style} className={obj.type === 'link' && obj.laudoDocId ? 'link2' : 'review'}
                                        onClick={
                                            () => obj.type === 'file' && obj.laudoDocId ? getFile(obj.laudoDocId)
                                                : obj?.action === 'info' ? showDetails(obj?.id)
                                                    //: obj?.action === 'delete' ? deleteFunction(laudo[idIndex]?.value)
                                                    : null}>
                                        {
                                            obj.type === 'date' ? dateFormat(obj.value)
                                                : obj?.action === 'info' ? <InfoIcon title={obj.title}/>
                                                    //: obj?.action === 'delete' && laudo[idIndex]?.value ? <DeleteIcon {...deleteIconProperties} />
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
