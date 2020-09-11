import React, { useState, useEffect } from 'react'
import moment from 'moment'

import TextField from '@material-ui/core/TextField'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import createFormPattern from '../Utils/createFormPattern'
import { formatDate } from '../Utils/formatValues'
import { procuradorEmpresaTable as procTable } from '../Forms/procuradorEmpresaTable'

export default function ShowDetails({ data, tab, title, header, close, empresas, procuracoes, procuradores, empresaDocs }) {

    const
        [procs, setProcs] = useState(),
        [table, setTable] = useState(),
        element = createFormPattern(tab, data) || []

    //Informações adicionais no showDetails fora dos campos padrão
    useEffect(() => {
        const additionalInfo = (tab) => {
            if (tab === 0) {
                let selectedProcs = [], tableHeaders = [], arrayOfRows = [], row = [], rowObj

                const
                    razaoSocial = element.find(el => el.field === 'razaoSocial')?.value,
                    delegatarioId = empresas.find(e => e.razaoSocial === razaoSocial)?.delegatarioId,
                    selectedDocs = procuracoes.filter(p => p.delegatarioId === delegatarioId)

                //Cria uma array de procuradores com base na array de procuradorId disponível na tabela Procuracao do Postgresql
                procuradores.forEach(pr => {
                    selectedDocs.forEach(doc => {
                        if (doc.procuradores.some(p => p === pr.procuradorId)) {

                            const
                                tableRow = { ...pr, vencimento: doc.vencimento },
                                file = empresaDocs.find(f => f.metadata.procuracaoId === doc.procuracaoId) // achar arquivo da procuração, se houver

                            if (file)
                                tableRow.fileId = file?.id
                            selectedProcs.push(tableRow)
                            arrayOfRows.push(tableRow)
                        }
                    })
                })

                selectedProcs.forEach(proc => {
                    procTable.forEach(fieldObj => {
                        const { field } = fieldObj
                        if (proc.hasOwnProperty(field) && !row.some(o => o.hasOwnProperty(field))) {
                            if (field === 'procuracao' && proc.fileId)
                                rowObj = { ...fieldObj, value: 'Clique para baixar a procuração', fileId: proc.fileId }
                            else
                                rowObj = { ...fieldObj, value: proc[field] }
                            console.log(rowObj, proc)
                            row.push(rowObj)
                        }
                    })
                    arrayOfRows.push(row)
                    row = []
                })

                //Cria uma array de arquivos com base no id de cada procuração
                console.log(arrayOfRows, procTable)
                if (selectedProcs[0]) {
                    setProcs(selectedProcs)
                    /* setTable({

                    }) */
                }

            }
        }
        additionalInfo(tab)
    }, [tab])

    return (
        <div className="popUpWindow" style={{ left: '20%', right: '20%' }}>
            <h4 className='equipaHeader'>{title} {data[header]}</h4> <hr />
            <main className="checkListContainer" style={{ justifyContent: 'flex-start' }}>
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
            </main>
            {procs &&
                <section>
                    <hr />
                    <h4>Procuradores cadastrados</h4>
                    {
                        procs.map(p =>
                            <span>{p.nomeProcurador} {
                                p.vencimento ? `- Procuração com vencimento em ${formatDate(p.vencimento)}`
                                    : '- Procuração por prazo indeterminado.'
                            }
                                {procs.length > 1 ? ' | ' : null}
                            </span>
                        )
                    }
                </section>}
            <ClosePopUpButton close={close} />
        </div>
    )
}