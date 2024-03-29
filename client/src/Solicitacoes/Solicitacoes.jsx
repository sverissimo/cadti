import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'

import SolHistory from './SolHistory'
import SolicitacoesTemplate from './SolicitacoesTemplate'
import SolicitacoesTable from './SolicitacoesTable'
import { logRoutesConfig } from './logRoutesConfig'
import AlertDialog from '../Reusable Components/AlertDialog'
import removePDF from '../Utils/removePDFButton'


function Solicitacoes(props) {

    const
        { veiculos, empresas, vehicleDocs, empresaDocs } = props.redux,
        { user } = props,
        [logs, setLogs] = useState([]),
        [showHistory, setShowHistory] = useState(false),
        [selectedLog, selectLog] = useState(),
        [completed, showCompleted] = useState(false),
        [historyLog, setHistoryLog] = useState(),
        [alertProperties, setAlertDialog] = useState({ openAlertDialog: false, customMessage: '', customTitle: '' }),
        [showFiles, setShowFiles] = useState(false),
        [filesIds, setFilesId] = useState(),
        { openAlertDialog, customTitle, customMessage } = alertProperties

    //Desabilita opção de exportar como PDF do material-table
    useEffect(() => {
        removePDF()
        return () => removePDF(true)
    }, [])

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

        async function getLogs() {

            const originalLogs = [...props.redux.logs]

            let logs = originalLogs.map(log => {
                log.empresa = empresas.find(e => e.codigoEmpresa === log.empresaId)?.razaoSocial
                log.veiculo = veiculos.find(v => v.veiculoId === log.veiculoId)?.placa
                const { __v, ...filtered } = log
                return filtered
            })

            if (completed) logs = logs.filter(l => l.completed === true)
            else logs = logs.filter(l => l.completed === false)
            setLogs(logs)
        }
        getLogs()

    }, [veiculos, empresas, completed, props.redux.logs])

    const assessDemand = async id => {

        let log = logs.find(l => l.id === id)
        selectLog(log)

        let pathname = logRoutesConfig.find(r => log?.subject.match(r.subject))?.path
        if (!pathname.match('/solicitacoes')) pathname = '/solicitacoes' + pathname
        props.history.push({ pathname, state: { demand: log } })
    }

    const showDetails = async id => {
        setHistoryLog(false)
        setShowFiles(false)

        const log = logs.find(l => l.id === id)
        await selectLog(log)
        setShowHistory(true)
    }

    const showInfo = index => {
        if (selectedLog && selectedLog?.history) {
            const historyLog = selectedLog?.history[index]

            if (!historyLog?.info)
                return
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
                tableData={logs}
                title={!completed ? 'Solicitações em andamento' : 'Solicitações concluídas'}
                user={user}
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
                empresaDocs={empresaDocs}
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

const collections = ['veiculos', 'empresas', 'logs', 'getFiles/vehicleDocs', 'getFiles/empresaDocs']

export default StoreHOC(collections, Solicitacoes)