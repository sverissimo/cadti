import { logRoutesConfig } from '../Solicitacoes/logRoutesConfig'

export const checkDemand = (id, logsCollection) => {

    const path = window.location.pathname

    logRoutesConfig.forEach((el, i) => el.path = logRoutesConfig[i].path.replace('/veiculos', '').replace('/solicitacoes', '').replace('/empresas', ''))

    const
        component = logRoutesConfig.find(c => path.match(c?.path)),
        subject = component?.subject,
        primaryKey = component?.primaryKey,
        // eslint-disable-next-line eqeqeq
        exists = logsCollection.find(log => log.subject === subject && log[primaryKey] == id && log.completed === false)

    if (exists)
        return exists
    else
        return false
}