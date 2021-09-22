//@ts-check
const
    AlertService = require("../services/AlertService")
    , editUser = require("../../users/editUser")
    , getUser = require("../../auth/getUser")


class AlertController {

    /**
     * @param {any} req
     */
    async getAlerts(req) {

        const
            user = await getUser(req)
            , alerts = await new AlertService({}).getAllAlerts(user)
        return alerts
    }

    /**
    * Marca mensagem como lida
    * @param {string[]} ids 
    * @param {boolean} readStatus
    * @returns {Promise<string>}
    */
    async changeReadStatus(ids, readStatus) {
        const result = await new AlertService({}).changeReadStatus(ids, readStatus)
        return result
    }


    /**
        * Marca mensagem como lida' para um determinado usuário
        * @param {any} req
        * @param {any} res
        * @returns {Promise}
        */
    async changeUserReadStatus(req, res) {
        await editUser(req, res)
        return 'updated message read status.'
    }

    /**
       * Apaga uma ou mais mensagens para um determinado usuário.
       * @param {any} req
       * @param {any} res
       * @returns {Promise}
       */
    async deleteUserAlerts(req, res) {
        await editUser(req, res)
        return 'Message(s) deleted.'
    }
}

module.exports = AlertController
