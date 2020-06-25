import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'

import SolHistory from './SolHistory'
import SolicitacoesTemplate from './SolicitacoesTemplate'
import SolicitacoesTable from './SolicitacoesTable'
import { logRoutesConfig } from './logRoutesConfig'


function Solicitacoes(props) {

    const
        { veiculos, empresas } = props.redux,
        [vehicleLogs, setVehicleLogs] = useState([]),
        [showHistory, setShowHistory] = useState(false),
        [selectedLog, selectLog] = useState(),
        [completed, showCompleted] = useState(false),
        [historyLog, setHistoryLog] = useState()

    //*********Effect adds eventListner to Esc key--> back/closes windows ************/
    useEffect(() => {
        function escFunction(e) {
            if (e.keyCode === 27) {
                if (historyLog) setHistoryLog()
                else setShowHistory()
            }
        }

        document.addEventListener('keydown', escFunction)
        return () => document.removeEventListener('keydown', escFunction)
    }, [historyLog])

    //********Prepares the Logs ArrayofObjects from the DB to be displayed with additional and filtered fields************/
    useEffect(() => {

        async function getVehicleLogs() {
            const originalLogs = [...props.redux.vehicleLogs]

            let logs = originalLogs.map(log => {
                log.empresa = empresas.find(e => e.delegatarioId.toString() === log.empresaId)?.razaoSocial
                log.veiculo = veiculos.find(v => v.veiculoId.toString() === log.veiculoId)?.placa
                const { __v, ...filtered } = log
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
        const pathname = logRoutesConfig.find(r => log?.subject.match(r.subject))?.path
        props.history.push({ pathname, state: { demand: log } })
    }

    const showDetails = async id => {
        const log = vehicleLogs.find(l => l.id === id)
        await selectLog(log)
        setShowHistory(true)
    }

    const showInfo = index => {
        if (selectedLog && selectedLog?.history) {

            const historyLog = selectedLog?.history[index]

            if (!historyLog?.info) return
            setHistoryLog(historyLog)
        }
    }

    const close = () => setShowHistory(false)

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