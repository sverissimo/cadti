import React from 'react'
import moment from 'moment'
import downloadFile from '../Utils/downloadFile'

import Button from '@material-ui/core/Button'
import AssignmentTurnedInOutlinedIcon from '@material-ui/icons/AssignmentTurnedInOutlined';
import InfoIcon from '@material-ui/icons/Info';
import DoneIcon from '@material-ui/icons/Done';
import HistoryIcon from '@material-ui/icons/History'
//import DeleteIcon from '@material-ui/icons/Delete';


export default function StandardTable({ tableData, staticFields, title, tableStyle, style, files, showDetails, assessDemand, completed, id, showInfo,
    idIndex = 0, deleteIconProperties = {}, deleteFunction, info }) {

    const dateFormat = value => {
        if (moment(value, 'YYYY-MM-DDTHH:mm:ss.SSSZZ', true).isValid()) {
            return moment(value, moment.ISO_8601, true).format('DD/MM/YYYY, HH:mm[h]')
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

    const createButton = (action, index) => {
        const disable = !tableData[index]?.info ? true : false

        switch (action) {
            case ('showHistory'):
                return <Button component='span' title='Ver histórico'>
                    <HistoryIcon color='primary' />
                </Button>

            case ('assess'):
                return <Button component='span' title='Analisar demanda'>
                    <AssignmentTurnedInOutlinedIcon style={{ color: 'rgb(255, 153, 51)' }} />
                </Button>

            case ('info'):
                if (disable) return <p> - </p>
                return <Button component='span' title='Ver informações adicionais'>
                    <InfoIcon color='primary' />
                </Button>

            case ('completed'):
                return <DoneIcon style={{ color: 'green' }} />

            default: return
        }
    }

    let
        tableHeaders = [],
        arrayOfRows = [],
        tableRow = []

    tableData.forEach((log, i) => {
        staticFields.forEach(obj => {

            if (!tableHeaders.includes(obj.title)) tableHeaders.push(obj.title)
            if (obj.field === 'info') tableRow.push({ ...obj, index: i })
            else if (obj.action) tableRow.push({ ...obj, id: log?.id })
            else tableRow.push({ ...obj, value: log[obj.field] })
        })

        arrayOfRows.push(tableRow)
        tableRow = []
    })
    if (completed) {
        const i = tableHeaders.indexOf('Analisar solicitação')
        tableHeaders[i] = 'Concluída'
    }
    const tableSpan = arrayOfRows[0]?.length || ''

    return (
        <table style={tableStyle || undefined}>
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
                                    <td key={i} style={obj?.style ? obj.style : style} className={obj.type === 'link' && obj.laudoDocId ? 'link2' : 'review'}

                                        onClick={
                                            () => obj.type === 'file' && obj.laudoDocId ? getFile(obj.laudoDocId)
                                                : obj?.action === 'showHistory' ? showDetails(obj?.id)
                                                    : obj?.action === 'assess' && !completed ? assessDemand(obj?.id)
                                                        : obj.field === 'info' ? showInfo(obj?.index)
                                                            //: obj?.action === 'delete' ? deleteFunction(laudo[idIndex]?.value)
                                                            : null}
                                    >
                                        {obj.type === 'date' ? dateFormat(obj.value)
                                            : obj?.action === 'assess' && completed ? createButton('completed')
                                                : obj?.action ? createButton(obj.action, obj?.index)
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
