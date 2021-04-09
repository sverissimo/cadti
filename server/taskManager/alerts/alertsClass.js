//@ts-check
const
    { pool } = require('../../config/pgConfig'),
    moment = require('moment'),
    sendMail = require('../../mail/sendMail'),
    setRecipients = require('./setRecipients')

class AlertsClass {

    async getCollection(collectionName) {
        const
            data = await pool.query(collectionName),
            collection = data.rows
        return collection
    }

    /**
     * //**Verifica itens de collections com vencimento em um determinado prazo (dias)
     * @param {Array} collection Tabela do Postgresql na qual será feita a verificação do vencimento
     */

    checkExpiring(collection) {
        const expiringItems = collection.filter(el => {
            const
                warningDate = moment().add(85, 'days'),
                //vencendo = moment(el.vencimento || el.validade).isSame(warningDate, 'days'),

                // **********************ADICIONAR OUTROS PRAZOS PARA ALERTA **************************
                warningDate2 = moment().add(5, 'days'),
                vencendo = moment(el.vencimento).isSame(warningDate, 'days') || moment(el.vencimento).isSame(warningDate2, 'days')
            //*****************************************************************************************/
            return vencendo
        })
        return expiringItems
    }

    //sendMail({ data: expiringItems, type: 'expiringItems' })

}

module.exports = AlertsClass