import axios from 'axios'
import { routesLabels } from './routesLabels'

export function logGenerator(obj) {
    const
        path = window.location.pathname,
        component = routesLabels.find(e => e.path === path)

    let subject = ''
    if (component) subject = component.subject

    const elementsToAdd = {
        subject,
        user: 'none'
    }

    const
        log = Object.assign(elementsToAdd, obj),
        post = axios.post('/api/logs', { log })
        
    return post
}