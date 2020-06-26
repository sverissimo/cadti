import axios from 'axios'
import { logRoutesConfig } from '../Solicitacoes/logRoutesConfig'

export const checkDemand = id => {
    let primaryKey, subject
    const path = window.location.pathname

    logRoutesConfig.forEach((el, i) => el.path = logRoutesConfig[i].path.replace('/veiculos', '').replace('/solicitacoes', '').replace('/empresas', ''))

    const
        component = logRoutesConfig.find(c => path.match(c?.path)),
        collection = component?.collection

    if (collection) {
        if (collection === 'vehicleLogs') {
            subject = component.subject
            primaryKey = 'veiculoId'
        }
        if (collection === 'empresaLogs') primaryKey = 'delegatarioId'

        const findLog = axios.get(`/api/log?collection=${collection}&subject=${subject}&primaryKey=${primaryKey}&id=${id}`)
        return findLog
    }

}