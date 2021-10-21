//@ts-check
const
    { pool } = require('../../config/pgConfig')
    , { socios: getSocsQuery } = require('../../queries')
    , { procuradores: getProcuradores } = require('../../allGetQueries')
    , getProcsQuery = getProcuradores()
    , parametrosModel = require('../../mongo/models/parametrosModel/parametrosModel')


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


    /**
     * Obtém os e-mails dos administradores e técnicos do sistema para notificações específicas
     * @returns Promise<Object>
     */
    async getAdminEmails() {

        const query = await parametrosModel.find()
            //@ts-ignore
            , adminEmails = query[0] && query[0].adminEmails
        return adminEmails
    }
}

module.exports = RecipientsRepository