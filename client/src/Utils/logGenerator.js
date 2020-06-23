import axios from 'axios'
import { routesLabels } from './routesLabels'
import { solRoutes } from '../Solicitacoes/solRoutes'

export function logGenerator(obj) {
    const
        path = window.location.pathname,
        route = routesLabels.find(e => path.match(e.shortPath)),
        solRoute = solRoutes.find(r => r.path.match(path)),
        collection = route?.collection,
        historyLength = obj.historyLength,
        commonFields = {
            user: 'Joe Demaggio',
            createdAt: new Date(),
        }

    let log = obj
    if (!obj.id || obj.subject) log.subject = obj?.subject || route?.subject

    const history = Object.assign(obj.history, commonFields)
    log.history = history || {}

    //****Se par o action é a resposta de cada rota caso contrário a demanda */
    if (historyLength && historyLength > 1) {
        if (historyLength % 2 === 0) {
            log.history.action = solRoute?.requestAction
            log.status = 'Aguardando análise'
            console.log('empresaReq', log)
        }
        else {

            log.history.action = solRoute?.responseAction
            log.status = 'Pendências'
            console.log('seinfraReq', log)
        }
    }

    if (obj?.history?.action) log.action = obj.history.action

    if (log.completed) {
        log.history.action = solRoute.concludedAction || obj.history.action || 'Solicitação concluída.'
        log.status = obj.status || 'Solicitação concluída.'
    }

    console.log(log, historyLength)
    const post = axios.post('/api/logs', { log, collection })
    return post
}