//@ts-check
const
    { pool } = require('../../config/pgConfig'),
    moment = require('moment'),
    setRecipients = require('./setRecipients')

class AlertClass {

    expiringItems = []
    /**Busca todos os itens de uma tabela do Postgresql
     * @param {string} collectionName nome da tabela para fazer o SELECT no banco de dados
     */
    async getCollection(collectionName) {
        const
            data = await pool.query(collectionName),
            collection = data.rows
        return collection
    }

    /**
     * //**Verifica itens de collections com vencimento em um determinado prazo (dias) ou em múltiplos prazos (alertas múltiplos).
     * @param {Array} collection Tabela do Postgresql na qual será feita a verificação do vencimento
     * @param {Array} prazos array de prazos, em dias. 
     */
    checkExpiring(collection, prazos) {
        const expiringItems = collection.filter(el => {
            const
                checkPrazo = prazo => moment(el.vencimento || el.validade).isSame(moment().add(prazo, 'days'), 'days'),
                vencendo = prazos.some(p => checkPrazo(p))

            return vencendo
        })
        this.expiringItems = expiringItems
        return expiringItems
    }

}

module.exports = AlertClass
