import axios from 'axios'
import { store } from '../App'
import { logRoutesConfig } from '../Solicitacoes/logRoutesConfig'
import { updateFilesMetadata, postFilesReturnIds } from './handleFiles'

export async function logGenerator(obj) {
    const
        path = window.location.pathname,
        userName = store.getState()?.user?.name || 'Usuário não identificado',
        codigoEmpresa = obj.empresaId

    console.log("🚀 ~ file: logGenerator.js:9 ~ logGenerator ~ path:", { path, obj })
    let logRoutes = JSON.parse(JSON.stringify(logRoutesConfig))
    logRoutes.forEach((el, i) => el.path = logRoutesConfig[i].path.replace('/veiculos', '').replace('/solicitacoes', '').replace('/empresas', ''))

    //Cria props padrão para todos os logs
    const
        collection = 'logs',
        historyLength = obj?.historyLength,
        commonFields = {
            user: userName,
            createdAt: new Date(),
        }

    let
        logConfig = logRoutes.find(e => path.match(e.path)),
        log = JSON.parse(JSON.stringify(obj))

    //Em caso de reativação de veículo, o path é o mesmo, aí o find tem q ser por subject
    if (obj.subject && obj.subject.match('Reativação'))
        logConfig = logRoutes.find(e => e.subject === obj.subject)

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

            if (!obj?.history?.action)
                log.history.action = logConfig?.requestAction
            log.status = 'Aguardando análise'
        }
        else {
            if (!obj?.history?.action)
                log.history.action = logConfig?.responseAction
            log.status = 'Pendências'
        }
    }

    //**********************if log already exists, no need to inform veiculoId **********************
    if (obj?.id && log.veiculoId) delete log.veiculoId
    delete log.historyLength

    //**********************If given by the component which called this function, overwrite logRoutesConfig*/
    if (!obj.id || obj.subject) log.subject = obj?.subject || logConfig?.subject

    //*************************IF DECLINED, UPDATE LOG AND RETURN LOG*/
    if (obj.declined) {
        log.history.action = 'Solicitação indeferida'
        log.status = 'Solicitação indeferida'
        log.completed = true

        const post = axios.post('/api/logs', { log, collection, codigoEmpresa })
        return post
    }

    //*************************CASO APROVADO, CONCLUI A SOLICITAÇÃO E ALTERA METADADOS DOS ARQUIVOS PARA TEMP:FALSE*/
    if (obj.approved && !obj.declined) {
        log.history.action = logConfig?.concludedAction || 'Solicitação concluída'
        log.status = 'Solicitação concluída'
        log.completed = true
        await updateFilesMetadata(obj, filesCollection)
    }

    //********************** Upload files and get their Ids***********************/
    const filesIds = await postFilesReturnIds(obj?.history?.files, obj?.metadata, log?.completed, filesEndPoint)

    if (filesIds)
        log.history.files = filesIds

    const { metadata, approved, demandFiles, ...filteredLog } = log
    //**********************reestablish path**********************
    logRoutes = JSON.parse(JSON.stringify(logRoutesConfig))
    logConfig = logRoutes.find(e => path.match(e.path))

    //**********************request and return promise**********************

    //console.log(JSON.stringify(filteredLog))
    const post = axios.post('/api/logs', { log: filteredLog, collection, codigoEmpresa })
    return post
}