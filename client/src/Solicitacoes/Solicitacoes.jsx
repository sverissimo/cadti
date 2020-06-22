import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'

import SolHistory from './SolHistory'
import SolicitacoesTemplate from './SolicitacoesTemplate'
import SolicitacoesTable from './SolicitacoesTable'
import { solRoutes } from './solRoutes'

function Solicitacoes(props) {

    const
        { veiculos, empresas } = props.redux,
        [vehicleLogs, setVehicleLogs] = useState([]),
        [showHistory, setShowHistory] = useState(false),
        [selectedLog, selectLog] = useState(),
        [completed, showCompleted] = useState(false),
        [historyLog, setHistoryLog] = useState()

    const escFunction = (e) => {
        if (e.keyCode === 27) close()
    }

    useEffect(() => {
        document.addEventListener('keydown', escFunction)
    }, [])

    useEffect(() => {

        async function getVehicleLogs() {
            const originalLogs = [...props.redux.vehicleLogs]

            let logs = originalLogs.map(log => {
                log.empresa = empresas.find(e => e.delegatarioId.toString() === log.empresaId)?.razaoSocial
                log.veiculo = veiculos.find(v => v.veiculoId.toString() === log.veiculoId)?.placa
                const { empresaId, veiculoId, __v, ...filtered } = log
                return filtered
            })

            if (completed) logs = logs.filter(l => l.completed === true)
            else logs = logs.filter(l => l.completed === false)
            setVehicleLogs(logs)
        }
        getVehicleLogs()

    }, [veiculos, empresas, completed, props.redux.vehicleLogs])

    const assessDemand = async id => {

        const log = vehicleLogs.find(l => l.id === id)
        selectLog(log)
        const pathname = solRoutes.find(r => log?.subject.match(r.subject))?.path
        props.history.push({ pathname, state: { demand: log } })
    }

    const showDetails = id => {
        setShowHistory(true)

        const log = vehicleLogs.find(l => l.id === id)
        selectLog(log)
    }

    const showInfo = index => {
        if (selectedLog && selectedLog?.history) {
            const historyLog = selectedLog?.history[index]
            setHistoryLog(historyLog)
        }
    }

    const close = () => {
        setShowHistory(false)
        setHistoryLog(false)
    }

    return (
        <>
            <SolicitacoesTemplate
                completed={completed}
                showCompleted={showCompleted}
            />
            <SolicitacoesTable
                tableData={vehicleLogs}
                title={!completed ? 'Solicitações em andamento' : 'Solicitações concluídas'}
                showDetails={showDetails}
                assessDemand={assessDemand}
                completed={completed}
                style={{ textAlign: 'center' }}
            />
            {showHistory && <SolHistory
                solicitacao={selectedLog}
                close={close}
                showInfo={showInfo}
                historyLog={historyLog}
                setHistoryLog={setHistoryLog}
            />
            }
        </>
    )
}

const collections = ['veiculos', 'empresas', '/logs/vehicleLogs']

export default StoreHOC(collections, Solicitacoes)