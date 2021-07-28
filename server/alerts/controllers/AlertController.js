//@ts-check
const AlertService = require("../services/AlertService");

class AlertController {

    /**
     * @param {any} req
     */
    async getAlerts(req) {

        const
            { user } = req
            , alerts = await new AlertService({}).getAllAlerts(user)
        return alerts
    }

    /**
    * Marca mensagem como lida
    * @param {string} id 
    * @param {boolean} readStatus
    * @returns {Promise<string>}
    */
    async changeReadStatus(id, readStatus) {
        const result = await new AlertService({}).changeReadStatus(id, readStatus)
        return result
    }
}

module.exports = AlertController
