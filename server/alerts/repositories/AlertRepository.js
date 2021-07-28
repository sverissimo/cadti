//@ts-check
const
    alertModel = require("../../mongo/models/alertModel")
    , { conn } = require("../../mongo/mongoConfig")
    , { pool } = require('../../config/pgConfig')


class AlertRepository {

    //Construtor para testes em ambiente de produção apenas
    constructor() {
        if (!process.env.DB && process.env.NODE_ENV !== 'production') {
            conn.on('error', console.error.bind(console, 'connection error:'))
            conn.once('open', () => {
                console.log('Testing alert... Mongo connected to the server.')
            })
        }
    }

    /**
     * Recupera os alertas do MongoDB. O filtro é aplicável se fornecido um array de empresas.
     * @param {number[]} empresas 
     * @returns 
     */
    async getAlertsFromDB(empresas) {

        let filter = {}
        if (empresas instanceof Array && empresas.length)
            filter = {
                $or: [
                    { 'empresaId': { $in: empresas } },
                    { 'codigo_empresa': { $in: empresas } }
                ]
            }
        const alerts = await alertModel.find(filter)
        return alerts
    }


    /**
    * Busca todos os itens de uma tabela do Postgresql, com base na query de cada child class     
    * @param {string} dbQuery
    * @returns {Promise} 
    * @throws {console.error('dbQuery needed.');}
    */
    async getCollection(dbQuery) {
        const
            data = await pool.query(dbQuery)
            , collection = data.rows
        return collection
    }


    /**
    * Altera o status do aviso (lida ou não lida)
    * @param {string} id 
    * @param {boolean} readStatus
    * @returns {Promise<string>}
    */
    async changeReadStatus(id, readStatus) {
        try {
            const update = await alertModel.findOneAndUpdate({ '_id': id }, { read: readStatus })
            console.log("🚀 ~ file: AlertRepository.js ~ line 46 ~ AlertRepository ~ markAsRead ~ update", update)

            return `${id} updated.`
        }
        catch (err) {
            return err.message
        }
    }

    save({ codigo_empresa, subject, vocativo, message }) {
        const
            alertObject = { codigo_empresa, subject, vocativo, message }
            , alertDoc = new alertModel(alertObject)

        alertDoc.save((err, doc) => {
            if (err)
                console.log(err)
            else
                console.log(doc)
        })
    }

    /**
     * 
     * @param {string} id 
     */
    async deleteAlert(id) {
        alertModel.deleteOne({ _id: id }, (err, doc) => {
            if (err)
                console.log(err)
            return doc
        })
    }
}

module.exports = AlertRepository