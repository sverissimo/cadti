import axios from 'axios'
import { logRoutesConfig } from '../Solicitacoes/logRoutesConfig'

export async function logGenerator(obj) {
    const path = window.location.pathname

    let logRoutes = JSON.parse(JSON.stringify(logRoutesConfig))
    logRoutes.forEach((el, i) => el.path = logRoutesConfig[i].path.replace('/veiculos', '').replace('/solicitacoes', '').replace('/empresas', ''))

    const
        collection = 'vehicleLogs',
        historyLength = obj.historyLength,
        commonFields = {
            user: 'Joe Dimaggio',
            createdAt: new Date(),
        }

    let
        logConfig = logRoutes.find(e => path.match(e.path)),
        log = JSON.parse(JSON.stringify(obj))

    const history = Object.assign(obj.history, commonFields)
    log.history = history || {}

    //Se par, a próxima action é a demanda de cada rota caso contrário a resposta. Depois apaga-se o historyLength */
    if (historyLength || historyLength === 0) {
        if (historyLength % 2 === 0 || historyLength === 0) {
            if (!obj?.history?.action) log.history.action = logConfig?.requestAction
            log.status = 'Aguardando análise'
        }
        else {

            if (!obj?.history?.action) log.history.action = logConfig?.responseAction
            log.status = 'Pendências'
        }
    }

    delete log.historyLength

    //**********************if log already exists, no need to inform veiculoId and empresaId**********************
    if (obj?.id && log.empresaId) delete log.empresaId
    if (obj?.id && log.veiculoId) delete log.veiculoId

    //**********************If given by the component which called this fuction, overwrite logRoutesConfig*/
    if (!obj.id || obj.subject) log.subject = obj?.subject || logConfig?.subject

    //********************** Upload files and get their Ids***********************/    
    let
        objFiles = obj?.files,
        files,
        filesIds = []

    //If completed, add standard action/status to the log and change files Status*/
    if (log.completed) {
        log.history.action = logConfig?.concludedAction || 'Solicitação concluída'
        log.status = obj?.status || 'Solicitação concluída'

        let ids

        //If there's any upload from Seinfra, it will overwrite the latestDocs(demandFiles) before approval
        if (objFiles instanceof FormData) {
            objFiles.set('tempFile', 'false')
            if (obj.demandFiles && obj.demandFiles[0]) {
                let oldFiles = obj.demandFiles
                for (let pair of objFiles) {
                    oldFiles.forEach((f, i) => {
                        if (pair[0] === f?.metadata?.fieldName)
                            oldFiles.splice(i, 1)
                    })
                }
                ids = oldFiles.map(f => f.id)
            }
        } else if (obj.demandFiles && obj.demandFiles[0])
            ids = obj.demandFiles.map(f => f.id)

        await axios.put('/api/updateFilesMetadata', { ids, collection: 'vehicleDocs', tempFile: 'false' })
            .then(r => console.log(r.data))
    }

    // log.completed or not, upload any new file attached by the user
    if (objFiles instanceof FormData) {
        let filesToSend = new FormData()
        
        if (!log.completed) filesToSend.set('tempFile', 'true')
        else filesToSend.set('tempFile', 'false')
        
        for (let pair of objFiles) {
            filesToSend.set(pair[0], pair[1])
        }
        
        files = await axios.post('/api/vehicleUpload', filesToSend)
    }

    if (files?.data?.file) {
        const filesArray = files.data.file
        filesIds = filesArray.map(f => f.id)
        log.history.files = filesIds
    }

    //**********************reestablish path**********************
    logRoutes = JSON.parse(JSON.stringify(logRoutesConfig))
    logConfig = logRoutes.find(e => path.match(e.path))

    //**********************request and return promisse**********************
    const post = axios.post('/api/logs', { log, collection })
    return post
}