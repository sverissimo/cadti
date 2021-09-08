//@ts-check
const
    Alert = require("./Alert"),
    { laudos: getAllLaudos } = require("../../allGetQueries"),
    laudos = getAllLaudos()


/**
 * Classe instanciada de Alert com métodos específicos para o alerta sobre o vencimento de laudos.
 * @extends Alert
 */

class LaudoAlert extends Alert {

    apolices = []

    /**
     * 
     * @param {Array<number>} prazos 
     */
    constructor(prazos) {
        super()
        this.subject = 'Vencimento de laudos de segurança veicular.'
        this.prazos = prazos
        //this.prazos = [5, 7, 8, 150]
        this.dbQuery = laudos
        this.messageIntro = 'Os laudos listados abaixo se encontram próximos do vencimento:'
        this.mailFields = ['id', 'empresa_laudo', 'placa', 'validade']
        this.mailHeaders = ['Número do Laudo', 'Emitido por', 'Veículo', 'Vencimento']
        this.messageTip = 'Para cadastrar um novo laudo de segurança veicular'
        this.tipPath = '\"Veículos\" >> \"Laudos\".'
    }
}

module.exports = LaudoAlert