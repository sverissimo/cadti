import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'

import SolHistory from './SolHistory'
import SolicitacoesTemplate from './SolicitacoesTemplate'

import { solicitacoesTable } from '../Forms/solicitacoesTable'
import Table from '../Reusable Components/Table'

function Solicitacoes(props) {

    const
        { veiculos, empresas } = props.redux,
        [vehicleLogs, setVehicleLogs] = useState([]),
        [showHistory, setshowHistory] = useState(false),
        [selectedLog, selectLog] = useState(),
        [completed, showCompleted] = useState(false),
        [info, setInfo] = useState()

    const escFunction = (e) => { if (e.keyCode === 27) setshowHistory(false) }

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false)
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
        props.history.push({ pathname: '/solicitacoes/baixaVeiculo', state: { demand: log } })

        //setShowDemand(!showDemand)
    }

    const showDetails = id => {
        setshowHistory(!showHistory)
        const log = vehicleLogs.find(l => l.id === id)
        selectLog(log)
    }
    const close = () => setshowHistory(false)
    const showInfo = index => {

        if (selectedLog && selectedLog?.history) {
            const history = selectedLog?.history[index]
            const additionalInfo = history?.info
            setInfo(additionalInfo)
        }
    }
    //if (selectedLog && showDemand) return <SolicitacoesRouter route='/solicitacoes/baixaVeiculo' data={selectedLog} history={props.history}/>

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
            {showHistory && <SolHistory
                solicitacao={selectedLog}
                close={close}
                showInfo={showInfo}
                info={info}
            />

            }
        </>
    )
}

const collections = ['veiculos', 'empresas', '/logs/vehicleLogs']

export default StoreHOC(collections, Solicitacoes)