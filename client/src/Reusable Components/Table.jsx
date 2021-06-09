import React from 'react'
import moment from 'moment'

import ShowFiles from './ShowFiles'

import Button from '@material-ui/core/Button'
import InfoIcon from '@material-ui/icons/Info';
import DoneIcon from '@material-ui/icons/Done';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

export default function StandardTable({ tableData, staticFields, title, tableStyle, style, completed, showInfo,
    showFiles, setShowFiles, filesCollection, primaryKey, close, filesIds, razaoSocial }) {

    const dateFormat = value => {
        if (moment(value, 'YYYY-MM-DDTHH:mm:ss.SSSZZ', true).isValid()) {
            return moment(value, moment.ISO_8601, true).format('DD/MM/YYYY, HH:mm[h]')
        }
        else return value
    }
    console.log(tableData[0].numeroDae || undefined)
    const createButton = (action, index, files) => {
        const disable = !tableData[index]?.info ? true : false
        const dStyle = { cursor: 'default' }

        switch (action) {
            case ('info'):
                return (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <span
                            className='button'
                            style={disable ? dStyle : {}}
                            component='span'
                            title={!disable ? 'Ver informações adicionais' : 'Nenhuma informação adicional'}
                            onClick={() => showInfo(index)} >
                            <InfoIcon color={!disable ? 'primary' : 'disabled'} />
                        </span>

                        {files ?
                            <span className='button' component='span' title='Ver arquivos' onClick={() => { setShowFiles(files) }
                            } >
                                <FileCopyOutlinedIcon />
                            </span>
                            :
                            <span style={{ padding: '2px 10px 0 17px' }}> - </span>
                        }
                    </div >
                )
            case ('completed'):
                return <DoneIcon style={{ color: 'green' }} />
            default: return
        }
    }

    //A tabela é uma array de arrays. Cada row é uma array de objects, que tem field, label, action, style, etc. Cada Object é um td
    let
        tableHeaders = [],
        arrayOfRows = [],
        tableRow = []

    tableData.forEach((log, i) => {
        staticFields.forEach(obj => {

            if (!tableHeaders.includes(obj.title)) tableHeaders.push(obj.title)
            if (obj.field === 'info') {
                tableRow.push({ ...obj, index: i, files: log?.files })
            }
            else if (obj.field === 'files') tableRow.push({ ...obj, files: log?.files })
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
        showFiles ? <>
            <ShowFiles
                filesCollection={filesCollection}
                close={close}
                typeId={primaryKey}
                filesIds={filesIds}
                razaoSocial={razaoSocial}
            />
            <footer>
                <div className='voltarDiv' style={{
                    padding: '0px',
                    margin: '30px 0 0 0',
                    position: 'absolute',
                    bottom: '1%',
                    zIndex: '10'
                }}>
                    <Button variant='outlined' color='primary' onClick={() => setShowFiles(false)}>
                        <ArrowBackIcon size='tiny' />
                        <span style={{ padding: '2px 0 0 2px', marginLeft: '2px', fontSize: '.85rem' }}>Voltar</span>
                    </Button>
                </div>
            </footer>
        </>
            :
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
                                        <td
                                            key={i}
                                            style={obj?.style ? obj.style : style}
                                            className={obj.type === 'link' && obj.laudoDocId ? 'link2' : 'review'}
                                            title={tableData[0].numeroDae || undefined}
                                        >
                                            {obj.type === 'date' ? dateFormat(obj.value)
                                                : obj?.action ? createButton(obj.action, obj?.index, obj?.files)
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
