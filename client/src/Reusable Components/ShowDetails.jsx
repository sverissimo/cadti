import React, { useState, useEffect } from 'react'
import moment from 'moment'
import CustomTable from './CustomTable'
import TextField from '@material-ui/core/TextField'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import createFormPattern from '../Utils/createFormPattern'
import { procuradorEmpresaTable as procTable } from '../Forms/procuradorEmpresaTable'
import altContratoTable from '../Forms/altContratoTable'
import TextArea from './TextArea'
import { procuracaoForm } from '../Forms/procuracaoForm'

export default function ShowDetails({ data, tab, title, header, close, empresas, procuracoes, procuradores, empresaDocs, altContrato }) {
    //data é o objeto (row) do campo de dados de uma determinada tabela
    const
        //    [procs, setProcs] = useState(),
        [table, setTable] = useState(),
        [table2, setTable2] = useState(),
        [tables, setTables] = useState([]),
        element = createFormPattern(tab, data) || [], //Element é o form com a adição do campo value, inserindo data para cada objeto(field)
        obs = element.find(el => el.field === 'obs'), //Informações adicionais no showDetails fora dos campos padrão (obs, equip, acess)
        equipamentos = element.find(el => el.field === 'equipamentos'),
        acessibilidade = element.find(el => el.field === 'acessibilidade')

    //Cria tabela de procuradores e altContrato se o elemento for empresa
    useEffect(() => {
        //Estabelece variáveis para uso nos tabs diferentes
        const
            razaoSocial = element.find(el => el.field === 'razaoSocial')?.value,
            codigoEmpresa = empresas.find(e => e.razaoSocial === razaoSocial)?.codigoEmpresa,
            selectedDocs = procuracoes.filter(p => p.codigoEmpresa === codigoEmpresa),
            selectedFiles = empresaDocs.filter(d => d.metadata?.fieldName === 'procuracao' && d.metadata?.empresaId === codigoEmpresa)
        let
            selectedProcs = [],
            tableHeaders = [],
            arrayOfRows = [],
            row = [],
            rowObj

        const additionalInfo = (tab) => {
            if (tab === 0) {
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
                        }
                    })
                })

                selectedProcs.forEach(proc => {
                    procTable.forEach(fieldObj => {
                        const { field } = fieldObj
                        //insere o cabeçalho da tabela (apenas uma vez)
                        if (!tableHeaders.some(t => t === fieldObj.title))
                            tableHeaders.push(fieldObj.title)
                        //insere as linhas (também apenas uma vez)
                        if (proc.hasOwnProperty(field) && !row.some(o => o.hasOwnProperty(field))) {

                            //se a coluna/field for um arquivo o valor que aparecerá na tabela é "Clique para baixar..."
                            if (field === 'fileId' && proc.fileId)
                                rowObj = { ...fieldObj, value: 'Clique para baixar a procuração', fileId: proc.fileId }
                            //Senão, o valor é o valor da célula
                            else
                                rowObj = { ...fieldObj, value: proc[field] }

                            //se a célula possuir um método de autoFormatação, aplicar
                            if (fieldObj.format) {
                                const value = fieldObj.format(proc[field])
                                rowObj = { ...fieldObj, value }
                            }
                            row.push(rowObj)
                        }
                    })
                    arrayOfRows.push(row)
                    row = []
                })

                //Cria uma array de arquivos com base no id de cada procuração              
                if (selectedProcs[0]) {
                    //setProcs(selectedProcs)
                    setTable({
                        mainTitle: `Procuradores cadastrados para ${data?.razaoSocial}`,
                        tableHeaders,
                        arrayOfRows,
                        docs: selectedFiles
                    })
                }
                setAltContrato()
            }
        }
        additionalInfo(tab)

        //Se o elemento for Procurador, exibir tabela com procurações
        if (tab === 2) {
            const
                procuradorId = (data?.procuradorId),
                procs = procuracoes.filter(p => p.procuradores.includes(procuradorId))
            let file
            procs.forEach(p => {
                file = empresaDocs.find(({ metadata }) => metadata?.procuracaoId === p.procuracaoId)
                p.fileId = file?.id
            })
            //console.log("🚀 ~ file: ShowDetails.jsx ~ line 99 ~ useEffect ~ file", procs)

            procs.forEach(proc => {
                procuracaoForm.forEach(fieldObj => {
                    const { field } = fieldObj
                    //insere o cabeçalho da tabela (apenas uma vez)
                    if (!tableHeaders.some(t => t === fieldObj.title))
                        tableHeaders.push(fieldObj.title)
                    //insere as linhas (também apenas uma vez)
                    if (proc.hasOwnProperty(field) && !row.some(o => o.hasOwnProperty(field))) {

                        //se a coluna/field for um arquivo o valor que aparecerá na tabela é "Clique para baixar..."
                        if (field === 'fileId' && proc.fileId)
                            rowObj = { ...fieldObj, value: 'Clique para baixar a procuração', fileId: proc.fileId }
                        //Senão, o valor é o valor da célula
                        else
                            rowObj = { ...fieldObj, value: proc[field] }

                        //se a célula possuir um método de autoFormatação, aplicar
                        if (fieldObj.format) {
                            const value = fieldObj.format(proc[field])
                            rowObj = { ...fieldObj, value }
                        }
                        row.push(rowObj)
                    }
                })
                arrayOfRows.push(row)
                row = []
            })
            //Cria uma array de arquivos com base no id de cada procuração              
            if (procs[0])
                setTable({
                    mainTitle: `Procurações cadastrados para ${data?.nomeProcurador}`,
                    tableHeaders,
                    arrayOfRows,
                    docs: empresaDocs
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])


    //Cria a tabela que lista as alterações de contrato social caso o objeto exibido seja uma empresa
    const setAltContrato = async () => {
        if (altContrato) {
            const
                alteracoes = altContrato.filter(a => a.codigoEmpresa === data.codigoEmpresa),
                altDocs = empresaDocs.filter(doc => doc?.metadata?.fieldName === 'altContratoDoc' && doc?.metadata.empresaId === data.codigoEmpresa)

            let tableHeaders = [], arrayOfRows = [], row = [], rowObj = {}

            alteracoes.forEach(alt => {
                altContratoTable.forEach(fieldObj => {
                    const { field } = fieldObj
                    if (!tableHeaders.includes(fieldObj.label))
                        tableHeaders.push(fieldObj.label)
                    if (field === 'fileId' || (alt.hasOwnProperty(field) && !row.some(o => o.hasOwnProperty(field)))) {
                        //se a coluna/field for um arquivo o valor que aparecerá na tabela é "Clique para baixar..."
                        if (field === 'fileId') {
                            let fileId = altDocs.find(d => d.metadata.numeroRegistro === alt.numeroRegistro)
                            fileId = fileId?.id
                            if (fileId)
                                rowObj = { ...fieldObj, value: fieldObj?.value, fileId }
                            else
                                rowObj = { ...fieldObj, value: '-' }

                        }
                        //Senão, o valor é o valor da célula
                        else
                            rowObj = { ...fieldObj, value: alt[field] }
                        //se a célula possuir um método de autoFormatação, aplicar
                        if (fieldObj.format) {
                            const value = fieldObj.format(alt[field])
                            rowObj = { ...fieldObj, value }
                        }
                        row.push(rowObj)
                    }
                })
                arrayOfRows.push(row)
                row = []
            })
            if (alteracoes[0]) {
                //setProcs(true)
                setTable2({
                    mainTitle: `Alterações do contrato social - ${data?.razaoSocial}`,
                    tableHeaders,
                    arrayOfRows,
                    docs: altDocs
                })
            }
        }
    }

    //Adiciona as tabelas
    useEffect(() => {
        const tableArray = []
        if (table)
            tableArray.push(table)
        if (table2)
            tableArray.unshift(table2)
        if (tableArray[0])
            setTables(tableArray)
    }, [table, table2])
    console.log(table)

    return (
        <div className="popUpWindow" style={{ left: '20%', right: '20%' }}>
            <h4 className='equipaHeader'>{title} {data[header]}</h4> <hr />
            <main className="checkListContainer" style={{ justifyContent: 'flex-start' }}>
                {
                    element.map(({ field, label, value, type, width }, i) => field !== 'obs' &&
                        field !== 'equipamentos' && field !== 'acessibilidade' &&
                        <div className="showDetailsItem" style={{ width: width ? width : 150, }} key={i}>
                            <TextField
                                name={field}
                                label={label}
                                value={type !== 'date' ? value || '' : moment(value).isValid() ? moment(value).format('DD/MM/YYYY') : ''}
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
            {
                //As tabelas aparecem nos detalhes das empresas, caso tenhamj procuradores e/ou alterações de contrato cadastrados
                tables[0] &&
                tables.map((table, i) =>
                    <section key={i}>
                        <hr style={{ margin: '12px 0' }} />
                        <CustomTable
                            length={table.tableHeaders.length}
                            title={table.mainTitle}
                            table={table}
                            style={{ textAlign: 'center', padding: '8px 0' }}
                            idIndex={1}
                            filePK='fileId'
                            docsCollection='empresaDocs'
                        />
                    </section>
                )
            }
            {
                //Se a tab for Veículos, há 3 textAreas depois dos detalhes: obs, equip e access.
                tab === 3 &&
                <footer className='flexColumn'>
                    {
                        equipamentos?.value &&
                        <TextArea
                            label='Equipamentos:'
                            name='equipamentos'
                            id='equipamentos'
                            defaultValue={equipamentos?.value}
                            rows='2'
                        />
                    }
                    {
                        acessibilidade?.value &&
                        <TextArea
                            label='Itens de acessibilidade:'
                            name='acessibilidade'
                            id='acessibilidade'
                            defaultValue={acessibilidade?.value}
                            rows='2'
                        />
                    }{
                        obs?.value &&
                        <TextArea
                            label='Observações:'
                            name='obs'
                            id='obs'
                            defaultValue={obs?.value}
                            rows='6'
                        />
                    }
                </footer>
            }
            <ClosePopUpButton close={close} />
        </div>
    )
}