import axios from 'axios'
import { logRoutesConfig } from '../Solicitacoes/logRoutesConfig'

export function logGenerator(obj) {
    const path = window.location.pathname

    logRoutesConfig.forEach((el, i) => el.path = logRoutesConfig[i].path.replace('/veiculos', '').replace('/solicitacoes', '').replace('/empresas', ''))
    
    console.log(logRoutesConfig)
    const
        logConfig = logRoutesConfig.find(e => path.match(e.path)),
        collection = logConfig?.collection,
        historyLength = obj.historyLength,
        commonFields = {
            user: 'Joe Dimaggio',
            createdAt: new Date(),
        }

    let log = JSON.parse(JSON.stringify(obj))

    const history = Object.assign(obj.history, commonFields)
    log.history = history || {}

    //Se par, a próxima action é a demanda de cada rota caso contrário a resposta. Depois apaga-se o historyLength */
    if (historyLength || historyLength === 0) {
        if (historyLength % 2 === 0 || historyLength === 0) {
            if (!obj?.history?.action) log.history.action = logConfig?.requestAction
            log.status = 'Aguardando análise'
            console.log('empresaReq', log)
        }
        else {

            if (!obj?.history?.action) log.history.action = logConfig?.responseAction
            log.status = 'Pendências'
            console.log('seinfraReq', log)
        }
    }

    delete log.historyLength

    //if log already exists, no need to inform veiculoId and empresaId
    if (obj?.id && log.empresaId) delete log.empresaId
    if (obj?.id && log.veiculoId) delete log.veiculoId

    //If given by the component which called this fuction, overwrite logRoutesConfig*/
    if (!obj.id || obj.subject) log.subject = obj?.subject || logConfig?.subject

    //If completed, add standard action/status to the log  */
    if (log.completed) {
        log.history.action = obj?.history?.action || logConfig?.concludedAction || 'Solicitação concluída'
        log.status = obj?.status || 'Solicitação concluída'
    }
    console.log(obj)
    //request and return promisse
    const post = axios.post('/api/logs', { log, collection })
    return post
}