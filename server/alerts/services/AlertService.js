//@ts-check
/**
 * @module AlertService
 */

const
    fs = require('fs')
    , path = require('path')
    , htmlGenerator = require('../../mail/htmlGenerator')
    , AlertRepository = require('../repositories/AlertRepository')
    , moment = require('moment')
    , Alert = require('../models/Alert');
const UserAlert = require('../userAlerts/UserAlert');
/**
 * Classe responsável por gerenciar e oferecer serviços de envio (ex: email) e armazenamento de alertas, além de método de testes. 
 */
class AlertService {

    dbQuery;

    /**Constructor
     * @param {object} alertObject Objeto instanciado da de uma subclasse herdada da classe Alert.js
     */
    constructor(alertObject) {
        /**
         * @property {String} dbQuery - script de SQL para buscar as entradas no banco Postgresql
         */
        this.dbQuery = alertObject.dbQuery
    }

    async getAllAlerts(user) {

        const
            { empresas, deletedMessages } = user
            , allAlerts = await new AlertRepository().getAlertsFromDB(empresas, deletedMessages)
        return allAlerts
    }

    /**
    * Busca todos os itens de uma tabela do Postgresql, com base na query de cada child class     
    * @returns {Promise} 
    * @throws Gera um erro se não houver se o objeto instanciado não tiver a prop dbQuery definida
    */
    async getCollection() {
        if (!this.dbQuery)
            throw new Error('this.dbQuery needed.');

        const collection = new AlertRepository().getCollection(this.dbQuery)
        return collection
    }

    /**
    * Altera o status do aviso (lida ou não lida)
    * @param {string[]} ids Array de ids dos respectivos avisos/alertas
    * @param {boolean} readStatus Boolean que representa se o aviso foi lido ou não
    * @returns {Promise<string>}
    */
    async changeReadStatus(ids, readStatus) {
        const result = await new AlertRepository().changeReadStatus(ids, readStatus)
        return result
    }

    /**
     * Verifica itens de collections com vencimento em um determinado prazo (dias) ou em múltiplos prazos (alertas múltiplos).
     * @param {Array} collection Tabela do Postgresql na qual será feita a verificação do vencimento
     * @param {Array} prazos array de prazos, em dias. 
     */
    checkExpiring(collection, prazos) {

        function checkPrazo(el, prazo) {
            const
                today = moment()
                , expiringDate = el.vencimento || el.validade

            if (!expiringDate) {
                return null
            }

            const prazoExpiring = moment(expiringDate).isSame(today.add(prazo, 'days'), 'days')
            return prazoExpiring
        }

        const expiringItems = collection.filter(el => prazos.some(p => checkPrazo(el, p)))
        return expiringItems
    }

    /**
     * Filtra as empresas das quais um ou mais elementos estão próximos do vencimento (ex: seguros, procurações, etc)
     * @param {Array} expiringItems - elementos a vencer
     * @returns {Array} array de objetos com as props codigo_empresa e razao_social
     * */
    getEmpresasToNotify(expiringItems) {

        const codigosEmpresas = []
        const empresas = expiringItems
            .filter(e => !codigosEmpresas.includes(e.codigo_empresa) && codigosEmpresas.push(e.codigo_empresa))
            .map(({ codigo_empresa, empresa, razao_social }) => ({ codigo_empresa, razao_social: empresa || razao_social }))

        return empresas
    }

    mockAlert({ to, subject, vocativo, message, html = null }) {

        vocativo = typeof vocativo === 'string' && vocativo
            .replace(/\./g, '')
            .replace(/\//g, '')
            .replace(/:/g, '')

        html = htmlGenerator({ vocativo, message })
            + '<br /><h5>Raw data:</h5>'
            + JSON.stringify(message)

        const
            filePath = path.join(__dirname, '..', 'mockAlertFiles')
            , fileName = filePath + `\\fakeEmail_${vocativo}.html`

        fs.writeFileSync(fileName, html)

        console.log("🚀 ~ file: AlertService.js ~ line 15 ~ mockAlert ~ to, subject, vocativo", { fileName, to, vocativo, subject })
        return 'alright.'
    }

    //Salva os avisos criados manualmente pelos usuários de role admin ou tecnico
    async saveUserAlert(req) {
        const
            io = req.app.get('io')
            , alertObject = new UserAlert(req.body)
            , alertRepository = new AlertRepository()
        if (alertObject.message)
            alertObject.message = JSON.stringify(alertObject.message)

        req.body.alertObject = alertObject
        const newAlert = await alertRepository.saveUserAlert(req)
        console.log("🚀 ~ file: AlertService.js ~ line 130 ~ AlertService ~ saveUserAlert ~ newAlert", newAlert)

        io.sockets.emit('insertElements', { insertedObjects: [newAlert], collection: 'avisos', })
    }

    saveAlert({ codigo_empresa, from, subject, vocativo, message }) {
        const
            alertObject = { codigo_empresa, from, subject, vocativo, message: JSON.stringify(message) }
            , alertRepository = new AlertRepository()

        alertRepository.save(alertObject)
    }
}

module.exports = AlertService

