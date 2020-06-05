import axios from 'axios'
import { routesLabels } from './routesLabels'

export function logGenerator(obj) {
    const
        path = window.location.pathname,
        route = routesLabels.find(e => e.path === path),
        collection = route?.collection,

        contentPattern = {
            user: 'none',
            createdAt: new Date(),
        }

    const content = Object.assign(obj.content, contentPattern)
    let log = obj

    log.subject = route?.subject
    log.content = content
    if (contentPattern.user === 'none') log.status = 'Aguardando aprovação'

    const post = axios.post('/api/logs', { log, collection })

    return post
}