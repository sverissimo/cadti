//@ts-check
const
    { pool } = require('../../config/pgConfig')
    , { socios: getSocsQuery } = require('../../queries')
    , { procuradores: getProcuradores } = require('../../allGetQueries')
    , getProcsQuery = getProcuradores()

class RecipientsRepository {

    /**
     * Obtém todos os sócios e procuradores do banco de dados
     * @returns Promise<Object>
     */
    getAllRecipients = async () => {

        const
            socsPromise = pool.query(getSocsQuery),
            procsPromise = pool.query(getProcsQuery),
            keys = ['socios', 'procuradores'],
            allRecipients = {}

        await Promise.all([socsPromise, procsPromise])
            .then(r =>
                r.forEach((q, i) => {
                    const key = keys[i]
                    Object.assign(allRecipients, { [key]: q.rows })
                })
            )

        return allRecipients
    }
}

module.exports = RecipientsRepository