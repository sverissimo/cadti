//@ts-check

/**
 * Factory simples de objetos instanciados de alerta
 * @module AlertFactory
 */


const
    SeguroAlert = require("./models/SeguroAlert")
    , ProcuracaoAlert = require("./models/ProcuracaoAlert")
    , LaudoAlert = require("./models/LaudoAlert")
    , AlertRepository = require("./repositories/AlertRepository")
    , Alert = require("./models/Alert");

/**      
 * @throws {InvalidArgumentException}
 * @yields {Alert} Gera uma instância de alerta
 */
class AlertFactory {

    /**@type {string} */
    alertType;

    constructor(type) {
        this.alertType = type
    }
    /**
     * 
     * @returns {Promise<Alert>}
     */
    async createAlert() {
        if (!this.alertType)
            throw new Error('AlertFactory: é necessário um tipo de alerta para ser instanciado.')

        const prazos = await new AlertRepository().getPrazos(this.alertType)
        console.log("🚀 ~ file: AlertFactory.js ~ line 26 ~ AlertFactory ~ createAlert ~ prazos", { type: this.alertType, prazos })
        switch (this.alertType) {
            case 'seguros':
                return new SeguroAlert(prazos)
            case 'procuracoes':
                return new ProcuracaoAlert(prazos)
            case 'laudos':
                return new LaudoAlert(prazos)
            default: return new Alert()
        }
    }
}

module.exports = AlertFactory
