import axios from 'axios'
import { routesLabels } from './routesLabels'

export function logGenerator(obj) {
    const
        path = window.location.pathname,
        route = routesLabels.find(e => e.path === path),
        collection = route?.collection,
        historyPattern = {
            user: 'Joe Demaggio',
            createdAt: new Date(),
        }

    let log = obj
    log.subject = route?.subject

    const history = Object.assign(obj.history, historyPattern)
    log.history = history

    const post = axios.post('/api/logs', { log, collection })
    return post
}