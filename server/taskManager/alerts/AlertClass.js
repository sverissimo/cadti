//@ts-check
const
    { pool } = require('../../config/pgConfig'),
    moment = require('moment')


class AlertClass {

    expiringItems = []
    /**
     * Busca todos os itens de uma tabela do Postgresql
     * @param {string} collectionName - nome da tabela para fazer o SELECT no banco de dados
     */
    async getCollection(collectionName) {
        const
            data = await pool.query(collectionName),
            collection = data.rows
        return collection
    }

    /**
     * Verifica itens de collections com vencimento em um determinado prazo (dias) ou em múltiplos prazos (alertas múltiplos).
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

    /**
     * Filtra as empresas das quais um ou mais elementos estão próximos do vencimento (ex: seguros, procurações, etc)
     * @param {Array} expiringItems - elementos a vencer
     * @returns {Array} array de objetos com as props codigo_empresa e razao_social
     * */
    getEmpresas(expiringItems) {
        //const empresas = new Set(expiringItems.map(e => e.codigo_empresa))
        const codigosEmpresas = []
        const empresas = expiringItems
            .filter(e => !codigosEmpresas.includes(e.codigo_empresa) && codigosEmpresas.push(e.codigo_empresa))
            .map(({ codigo_empresa, empresa }) => ({ codigo_empresa, razao_social: empresa }))

        return empresas
    }
}

module.exports = AlertClass
