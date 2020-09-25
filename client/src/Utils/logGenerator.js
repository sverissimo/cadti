import axios from 'axios'
import { logRoutesConfig } from '../Solicitacoes/logRoutesConfig'
import { updateFilesMetadata, postFilesReturnIds } from './handleFiles'

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

    // if !veiculoId, update to empresaDocs
    let
        filesCollection = 'vehicleDocs',
        filesEndPoint = 'vehicleUpload'
    if (!obj.veiculoId) {
        filesCollection = 'empresaDocs'
        filesEndPoint = 'empresaUpload'
    }

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


    //*************************IF DECLINED, UPDATE LOG AND RETURN LOG*/    
    if (obj.declined) {
        log.history.action = 'Solicitação indeferida'
        log.status = 'Solicitação indeferida'
        log.completed = true

        const post = axios.post('/api/logs', { log, collection })
        return post
    }
    if (obj.approved && !obj.declined) {
        log.history.action = logConfig?.concludedAction || 'Solicitação concluída'
        log.status = 'Solicitação concluída'
        log.completed = true
        updateFilesMetadata(obj, filesCollection)
    }

    //********************** Upload files and get their Ids***********************/    

    const filesIds = await postFilesReturnIds(obj?.history?.files, obj?.metadata, log?.completed, filesEndPoint)

    if (filesIds)
        log.history.files = filesIds

    const { metadata, approved, demandFiles, ...filteredLog } = log

    //**********************reestablish path**********************
    logRoutes = JSON.parse(JSON.stringify(logRoutesConfig))
    logConfig = logRoutes.find(e => path.match(e.path))

    //**********************request and return promisse**********************

    const post = axios.post('/api/logs', { log: filteredLog, collection })
    return post
}