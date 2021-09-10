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

        const
            prazos = await new AlertRepository().getPrazos(this.alertType)
            , from = await new AlertRepository().getSystemName()


        switch (this.alertType) {
            case 'seguros':
                return new SeguroAlert(from, prazos)
            case 'procuracoes':
                return new ProcuracaoAlert(from, prazos)
            case 'laudos':
                return new LaudoAlert(from, prazos)
            default: return new Alert()
        }
    }
}

module.exports = AlertFactory
