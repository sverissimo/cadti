import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import StoreHOC from '../Store/StoreHOC'
import { ReactContext } from '../Store/ReactContext'

import Solicitacao from './Solicitacao'
import SolicitacoesTemplate from './SolicitacoesTemplate'
import { solicitacoesTable } from '../Forms/solicitacoesTable'
import Table from '../Reusable Components/Table'

function Solicitacoes(props) {

    const
        { veiculos, empresas } = props.redux,
        [vehicleLogs, setVehicleLogs] = useState([]),
        [showInfo, setShowInfo] = useState(false),
        [selectedLog, selectLog] = useState(),
        [completed, showCompleted] = useState(false)

    const { context, setContext } = useContext(ReactContext)

    useEffect(() => {

        async function getVehicleLogs() {
            const query = await axios.get('/api/logs/vehicleLogsModel')
            let logs = query.data

            logs.forEach((log, i) => {
                logs[i].empresa = empresas.find(e => e.delegatarioId.toString() === log.empresaId)?.razaoSocial
                logs[i].veiculo = veiculos.find(v => v.veiculoId.toString() === log.veiculoId)?.placa
                const { empresaId, veiculoId, __v, ...filtered } = log
                logs[i] = filtered
            })
            if (completed) logs = logs.filter(l => l.completed === true)
            else logs = logs.filter(l => l.completed === false)
            setVehicleLogs(logs)
        }


        getVehicleLogs()
    }, [veiculos, empresas, completed])

    const assessDemand = async id => {
        const log = vehicleLogs.find(l => l._id === id)

        await setContext({ ...context, demand: log })
        props.history.push('/veiculos/baixaVeiculo')
    }


    const showDetails = id => {
        setShowInfo(!showInfo)
        const log = vehicleLogs.find(l => l._id === id)
        selectLog(log)
    }
    const close = () => setShowInfo(false)



    return (
        <>
            <SolicitacoesTemplate
                completed={completed}
                showCompleted={showCompleted}
            />
            <Table
                tableData={vehicleLogs}
                staticFields={solicitacoesTable}
                length={5}
                title='Solicitações em andamento'
                showDetails={showDetails}
                assessDemand={assessDemand}
                completed={completed}
                style={{ textAlign: 'center' }}
            />
            {showInfo && <Solicitacao
                solicitacao={selectedLog}
                close={close}
            />}
        </>
    )
}

const collections = ['veiculos', 'empresas']

export default StoreHOC(collections, Solicitacoes)