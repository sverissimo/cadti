//@ts-check
import React, { useState, useEffect } from 'react'
import moment from 'moment'
import CustomTable from './CustomTable'
import TextField from '@material-ui/core/TextField'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'
import createFormPattern from '../Utils/createFormPattern'
import TextArea from './TextArea'
import { stringBR } from '../Veiculos/checkWeight'
import { getAltContratuaisTable, getProcuracoesTable, getProcuradoresTable } from '../Consultas/getAccessoryTables'

export default function ShowDetails({ data, tab, title, header, close, empresas, procuracoes, procuradores, empresaDocs, altContrato }) {
    //data é o objeto (row) do campo de dados de uma determinada tabela
    /**@type {Array} useState<>      */
    const [tables, setTables] = useState([])
    const element = createFormPattern(tab, data) || [] //Element é o form com a adição do campo value, inserindo data para cada objeto(field)
    const obs = element.find(el => el.field === 'obs') //Informações adicionais no showDetails fora dos campos padrão (obs, equip, acessibilidade)
    const equipamentos = element.find(el => el.field === 'equipamentos')
    const acessibilidade = element.find(el => el.field === 'acessibilidade')


    useEffect(() => {
        //Cria tabela secundária de procuradores e altContrato se o elemento for empresa
        if (tab === 0) {
            const table = getProcuradoresTable({ tab, data, empresas, procuradores, procuracoes, empresaDocs })
            const table2 = getAltContratuaisTable({ altContrato, data, empresaDocs })
            const validTables = [table, table2].filter(t => !!t)
            setTables(validTables)
        }
        //Se o elemento for Procurador, exibir tabela com procurações
        if (tab === 2) {
            const procuracoesTable = getProcuracoesTable({ data, procuracoes, empresaDocs })
            procuracoesTable && setTables([procuracoesTable])
        }
        return () => { setTables([]) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, altContrato])

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
                                value={
                                    label.match('Peso ') ?
                                        stringBR(value)
                                        : type !== 'date' ?
                                            value || ''
                                            : moment(value, true).isValid() ?
                                                value && moment(value).format('DD/MM/YYYY')
                                                : ''
                                }
                                InputLabelProps={{ shrink: true, style: { fontSize: '0.9rem', fontWeight: 500 } }}
                                inputProps={{
                                    style: {
                                        fontSize: '0.7rem',
                                        width: width ? width : 150,
                                        textAlign: 'center'
                                    }
                                }}
                                variant='outlined'
                            />
                        </div>
                    )}
            </main>
            {
                !!tables.length && tables.map((table, i) => (
                    <section key={i}>
                        <hr style={{ margin: '12px 0' }} />
                        {//@ts-ignore
                            <CustomTable
                                length={table.tableHeaders.length}
                                title={table.mainTitle}
                                table={table}
                                style={{ textAlign: 'center', padding: '8px 0' }}
                                idIndex={1}
                                filePK='fileId'
                                docsCollection='empresaDocs'
                            />
                        }
                    </section>
                ))
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
