import React, { useEffect, useState } from 'react'

import StoreHOC from '../Store/StoreHOC'

import SolHistory from './SolHistory'
import SolicitacoesTemplate from './SolicitacoesTemplate'
import SolicitacoesTable from './SolicitacoesTable'
import { logRoutesConfig } from './logRoutesConfig'
import AlertDialog from '../Reusable Components/AlertDialog'


function Solicitacoes(props) {

    const
        { veiculos, empresas, vehicleDocs } = props.redux,
        [vehicleLogs, setVehicleLogs] = useState([]),
        [showHistory, setShowHistory] = useState(false),
        [selectedLog, selectLog] = useState(),
        [completed, showCompleted] = useState(false),
        [historyLog, setHistoryLog] = useState(),
        [alertProperties, setAlertDialog] = useState({ openAlertDialog: false, customMessage: '', customTitle: '' }),
        [showFiles, setShowFiles] = useState(false),
        [filesIds, setFilesId] = useState(),
        { openAlertDialog, customTitle, customMessage } = alertProperties

    //*********Effect adds eventListner to Esc key--> back/closes windows ************/
    useEffect(() => {
        function escFunction(e) {
            if (e.keyCode === 27) {
                if (!showFiles && !historyLog) setShowHistory()
                if (showFiles) setShowFiles(false)
                else if (historyLog) setHistoryLog()
            }
        }
        document.addEventListener('keydown', escFunction)
        return () => document.removeEventListener('keydown', escFunction)
    }, [historyLog, showFiles])

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

        let log = vehicleLogs.find(l => l.id === id)
        selectLog(log)

        //Make sure vehicle still exists
       /*  const vehicle = veiculos.find(v => v.veiculoId.toString() === log.veiculoId.toString())

        if (!vehicle) {
            const customTitle = 'Veículo não encontrado',
                customMessage = `O veículo para o qual a demanda foi informada não foi encontrado. Verifique se o veículo está registrado em "Consultas -> Veículos"`
            await setAlertDialog({ openAlertDialog: true, customTitle, customMessage })
            return
        } */

        let pathname = logRoutesConfig.find(r => log?.subject.match(r.subject))?.path
        if (!pathname.match('/solicitacoes')) pathname = '/solicitacoes' + pathname
        props.history.push({ pathname, state: { demand: log } })
    }

    const showDetails = async id => {
        setHistoryLog(false)
        setShowFiles(false)

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
    const renderFiles = (ids) => {
        if (ids) {
            setShowFiles(true)
            setFilesId(ids)
        }
        else setShowFiles(false)
    }

    const toggleAlertDialog = () => setAlertDialog({ ...alertProperties, openAlertDialog: !openAlertDialog })
    const close = () => {
        setShowHistory(false)
        setShowFiles(false)
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
                vehicleDocs={vehicleDocs}
                setShowFiles={renderFiles}
                showFiles={showFiles}
                filesIds={filesIds}
            />
            }
            {openAlertDialog &&
                <AlertDialog open={openAlertDialog} close={toggleAlertDialog} customMessage={customMessage} customTitle={customTitle} />}
        </>
    )
}

const collections = ['veiculos', 'empresas', '/logs/vehicleLogs', 'getFiles/vehicleDocs']

export default StoreHOC(collections, Solicitacoes)