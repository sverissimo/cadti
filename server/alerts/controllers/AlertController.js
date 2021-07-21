//@ts-check
const AlertService = require("../services/AlertService");

class AlertController {

    async getAlerts() {
        const alerts = await new AlertService({}).getAllAlerts()
        return alerts
    }

}

module.exports = AlertController
