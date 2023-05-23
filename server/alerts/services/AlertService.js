//@ts-check
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const htmlGenerator = require('../../mail/htmlGenerator')
const sendMail = require('../../mail/sendMail')
const AlertRepository = require('../repositories/AlertRepository')
const UserAlert = require('../userAlerts/UserAlert')

/**
* Classe responsável por gerenciar e oferecer serviços de envio (ex: email) e armazenamento de alertas, além de método de testes.
*/
class AlertService {

    dbQuery;

    /**Constructor
     * @param {object} [alertObject] Objeto instanciado da de uma subclasse herdada da classe Alert.js
     */
    constructor(alertObject) {
        /**
         * @property {String} dbQuery - script de SQL para buscar as entradas no banco Postgresql
         */
        this.dbQuery = alertObject && alertObject.dbQuery
    }

    async getAllAlerts(user) {
        const { empresas, deletedMessages } = user
        const allAlerts = await new AlertRepository().getAlertsFromDB(empresas, deletedMessages)
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

    mockAlert({ to, subject, vocativo, message, html = '' }) {

        vocativo = typeof vocativo === 'string' && vocativo
            .replace(/\./g, '')
            .replace(/\//g, '')
            .replace(/:/g, '')

        if (!html)
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
    async saveAlert(alert) {
        try {
            const alertObject = new UserAlert(alert)
            alertObject.message = JSON.stringify(alertObject.message)
            const newAlert = await new AlertRepository().saveAlert(alertObject)
            return newAlert

        } catch (err) {
            throw new Error(err)
        }
    }

    /**
     * Organiza e envia todos os alertas em um único para os técnicos/admins do sistema
     * @param {Array} allMessages - Array de objetos com todas os avisos/alertas disparados em um dia
     */
    sendAlertsToAdmin(allMessages, adminEmails) {

        if (!allMessages[0] || !adminEmails)
            return

        const
            intro = allMessages[0].intro
            , subject = allMessages[0].subject
            , tableHeaders = allMessages[0].tableHeaders
            , allTableData = []
            , to = adminEmails
        tableHeaders.unshift('Empresa')

        for (let m of allMessages) {
            m.tableData.forEach(obj => {
                const td = Object.assign({ empresa: m.vocativo }, obj)
                allTableData.push(td)
            })
        }

        const
            message = {
                intro,
                tableData: allTableData,
                tableHeaders,
                customFooter: 'Aviso automático do CadTI'
            }
        //console.log("🚀 ~ file: AlertService.js ~ line 165 ~ AlertService ~ sendAlertsToAdmin ~ message ", JSON.stringify(message))

        //const html = htmlGenerator({ vocativo: 'Equipe DGTI', message })
        //this.mockAlert({ to: 'me', subject, vocativo: 'Equipe DGTI', message, html })
        sendMail({ to, subject, vocativo: 'Equipe DGTI', message, sendMail: true })
        //console.log("🚀 ~ file: AlertService.js ~ line 180 ~ AlertService ~ sendAlertsToAdmin ~ html", html)
    }
}

//unifiedTable = tableGenerator(allTableData, tableHeaders)
module.exports = AlertService

