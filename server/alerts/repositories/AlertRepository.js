//@ts-check
const mongoose = require("mongoose")
const
    alertModel = require("../../mongo/models/alertModel")
    , parametrosModel = require("../../mongo/models/parametrosModel/parametrosModel")
    , { pool } = require('../../config/pgConfig')


class AlertRepository {

    //Construtor para testes em ambiente de produção apenas
    constructor() {
        if (!process.env.DB && process.env.NODE_ENV !== 'production') {
            const { conn } = require("../../mongo/mongoConfig")
            conn.once('open', () => {
                console.log('Running alerts Repository... Mongo connected to the server.')
            })
        }
    }

    /**
     * Recupera os prazos de alertas do MongoDB, conforme o tipo de alerta passado como arg.
     * @param {string} alertType
     * @returns {Promise}
     */
    async getPrazos(alertType) {
        alertType = alertType
            .replace('laudos', 'Laudo')
            .replace('procuracoes', 'Procuracao')
            .replace('seguros', 'Seguro')

        const
            alertTypeDeadline = `prazoAlerta${alertType}`
            , parametros = await parametrosModel.find()
            // @ts-ignore
            , prazosParaAlerta = parametros[0].prazosAlerta && parametros[0].prazosAlerta[alertTypeDeadline]

        return prazosParaAlerta
    }

    /**
     * Recupera os alertas do MongoDB. O filtro é aplicável se fornecido um array de empresas.
     * @param {number[]} empresas
     * @returns {Promise<Array>}
     */
    async getAlertsFromDB(empresas, deletedMessages) {

        //deletedMessages = deletedMessages.map(m => new mongoose.mongo.ObjectID(m))

        let filter = { _id: { $nin: deletedMessages } }
        if (empresas instanceof Array && empresas.length)
            //@ts-ignore
            filter = {
                _id: { $nin: deletedMessages },
                $or: [
                    { 'empresaId': { $in: empresas } },
                    { 'codigo_empresa': { $in: empresas } },
                    { 'codigo_empresa': 1 }
                ]
            }
        const alerts = await alertModel.find(filter)
        return alerts
    }


    /**
    * Busca todos os itens de uma tabela do Postgresql, com base na query de cada child class
    * @param {string} dbQuery
    * @returns {Promise}
    * @throws {InvalidArgumentException}
    */
    async getCollection(dbQuery) {
        if (!dbQuery)
            throw new Error('dbQuery obrigatório.')
        const
            data = await pool.query(dbQuery)
            , collection = data.rows
        return collection
    }

    /**
    * Busca o nome do sistema na coleção "parametros" do mongoDB para adicionar ao atributo "from" da classe Alert.js como padrão.
    * @returns {Promise<string>} - Retorna a sigla do sistema
    */
    async getSystemName() {
        const
            parametros = await parametrosModel.find()
            // @ts-ignore
            , systemName = parametros[0].nomes.siglaSistema
        return systemName
    }

    /**
    * Altera o status do aviso (lida ou não lida)
    * @param {string[]} ids
    * @param {boolean} readStatus
    * @returns {Promise<string>}
    */
    async changeReadStatus(ids, readStatus) {
        try {
            //const update = await alertModel.findOneAndUpdate({ '_id': id }, { read: readStatus })
            const update = await alertModel.updateMany({ '_id': { $in: ids } }, { read: readStatus })
            console.log("🚀 ~ file: AlertRepository.js ~ line 46 ~ AlertRepository ~ markAsRead ~ update", update)

            return `${ids.toString()} updated.`
        }
        catch (err) {
            return err.message
        }
    }

    save({ codigo_empresa, from, subject, vocativo, message }) {
        const
            alertObject = { codigo_empresa, from, subject, vocativo, message }
            , alertDoc = new alertModel(alertObject)

        alertDoc.save((err, doc) => {
            if (err)
                console.log(err)
            console.log(doc)
        })
    }


    async saveAlert(alert) {
        const alertDoc = new alertModel(alert)
        const result = await alertDoc.save()
        console.log("🚀 ~ file: AlertRepository.js:131 ~ AlertRepository ~ saveAlert ~ result:", result)
        console.log("🚀 ~ file: AlertRepository.js:128 ~ AlertRepository ~ saveAlert ~ alertDoc:", alertDoc)
        return alertDoc
    }

    /**
     *
     * @param {Array<string>} ids
     */
    async deleteAlerts(ids) {
        const mongoIds = ids.map(id => new mongoose.mongo.ObjectID(id))
        const { deletedCount } = await alertModel.deleteMany({ _id: { $in: mongoIds } })
        if (!deletedCount) {
            return 'No alerts found with the given IDs...'
        }
        return `${deletedCount} entries (messages) removed from MongoDB...`
    }

    async getOldAlerts(monthsOld = 3) {
        const monthsAgo = new Date()
        monthsAgo.setMonth(monthsAgo.getMonth() - monthsOld)

        try {
            const oldDocuments = await alertModel.find({
                createdAt: {
                    $lt: monthsAgo
                }
            }).exec()

            return oldDocuments
        } catch (error) {
            console.error(error)
            return null
        }
    }
}

module.exports = AlertRepository
