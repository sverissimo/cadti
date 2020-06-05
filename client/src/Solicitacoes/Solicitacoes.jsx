import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import StoreHOC from '../Store/StoreHOC'

import { solicitacoesTable } from '../Forms/solicitacoesTable'
import Table from '../Reusable Components/Table'

function Solicitacoes(props) {

    const
        { veiculos, empresas } = props.redux,
        [vehicleLogs, setVehicleLogs] = useState([]),
        [table, setTable] = useState()

    useEffect(() => {

        async function getVehicleLogs() {
            const query = await axios.get('/api/logs/vehicleLogsModel')
            let logs = query.data

            logs.forEach((log, i) => {
                logs[i].empresa = empresas.find(e => e.delegatarioId.toString() === log.empresaId)?.razaoSocial
                logs[i].veiculo = veiculos.find(v => v.veiculoId.toString() === log.veiculoId)?.placa
                const { _id, empresaId, veiculoId, __v, ...filtered } = log
                logs[i] = filtered
            })

            setVehicleLogs(logs)
        }
        getVehicleLogs()
    }, [])


    useEffect(() => {
        async function formatTable (){
            let
                tableHeaders = [],
                arrayOfRows = [],
                tableRow = []

            const table = [...solicitacoesTable]

            vehicleLogs.forEach(log => {
                table.forEach(obj => {
                    if (!tableHeaders.includes(obj.title)) tableHeaders.push(obj.title)
                    tableRow.push({ ...obj, value: log[obj.field] })
                })
                arrayOfRows.push(tableRow)
                tableRow = []
            })

            await setTable({ tableHeaders, arrayOfRows })
        }

        formatTable()
    }, [vehicleLogs])


    return (
        <>
            {table && <Table
                table={table}
                length= {5}
                title='Whatever'
            />}
        </>
    )
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, Solicitacoes)

/* Fuck
<div>
    {vehicleLogs && vehicleLogs.map(log => {
        return Object.keys(log).map(key =>
            key !== 'content' &&
            <ul>
                <li>{key}: {log[key]}</li>
            </ul>
        )

    })

    }

</div> */