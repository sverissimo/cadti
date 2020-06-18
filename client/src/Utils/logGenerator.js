import axios from 'axios'
import { routesLabels } from './routesLabels'

export function logGenerator(obj) {
    const
        path = window.location.pathname,
        route = routesLabels.find(e => path.match(e.path)),
        collection = route?.collection,
        commonFields = {
            user: 'Joe Demaggio',
            createdAt: new Date(),
        }

    let log = obj
    if (!obj.id || obj.subject) log.subject = obj.subject || route?.subject
    
    const history = Object.assign(obj.history, commonFields)
    log.history = history

    const post = axios.post('/api/logs', { log, collection })
    return post
}