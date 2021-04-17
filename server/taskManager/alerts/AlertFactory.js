//@ts-check
const
    SeguroAlert = require("./SeguroAlert"),
    ProcuracaoAlert = require("./ProcuracaoAlert"),
    LaudoAlert = require("./LaudoAlert");

/**      
 * @throws {InvalidArgumentException}
 * @yields {object} Gera uma classe de alerta
 */
class AlertFactory {

    /**@type {string} */
    alertType;

    constructor(type) {
        this.alertType = type
    }

    createAlert() {
        if (!this.alertType)
            throw new Error('AlertFactory: é necessário um tipo de alerta para ser instanciado.')

        switch (this.alertType) {
            case 'seguros':
                return new SeguroAlert()
            case 'procuracoes':
                return new ProcuracaoAlert()
            case 'laudos':
                return new LaudoAlert()
            default: return {}
        }
    }
}

module.exports = AlertFactory
