import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'

import Solicitacao from './Solicitacao'
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
            let logs = [...props.redux.vehicleLogs]

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

    }, [veiculos, empresas, completed, props.redux.vehicleLogs])

    const assessDemand = async id => {
        const
            log = vehicleLogs.find(l => l.id === id),
            demand = JSON.stringify(log)

        localStorage.setItem('demand', demand)
        props.history.push({ pathname: '/veiculos/baixaVeiculo' })
    }

    const showDetails = id => {
        setshowHistory(!showHistory)
        const log = vehicleLogs.find(l => l.id === id)
        selectLog(log)
    }
    const close = () => setshowHistory(false)
    const showInfo = index => {

        console.log(index, selectedLog)
        if (selectedLog && selectedLog?.history) {

            const history = selectedLog?.history[index]
            const additionalInfo = history?.info
            console.log(additionalInfo)
            setInfo(additionalInfo)
        }
    }
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
            {showHistory && <Solicitacao
                solicitacao={selectedLog}
                close={close}
                showInfo={showInfo}
                info={info}
            />}
        </>
    )
}

const collections = ['veiculos', 'empresas', '/logs/vehicleLogs']

export default StoreHOC(collections, Solicitacoes)