//@ts-check
const Alert = require("./Alert")
const { seguros } = require("../../queries")


//**Classe instanciada de Alert com métodos específicos para o alerta sobre o vencimento de seguros 
class SeguroAlert extends Alert {

    apolices = []

    constructor() {
        super()
        this.subject = 'Vencimento de apólices de seguro.'
        this.prazos = [11, 17, 26, 74, 77]
        // this.prazos = [2, 18]
        this.dbQuery = seguros
        this.messageIntro = 'Os seguros listados abaixo se encontram próximos do vencimento:'
        this.mailFields = ['apolice', 'vencimento', 'segurados']
        this.mailHeaders = ['Apólice', 'Vencimento', 'Veículos Segurados']
        this.messageTip = 'Para atualizar ou cadastrar uma nova apólice'
        this.tipPath = '\"Veículos\" >> \"Seguros\".'
    }
}

module.exports = SeguroAlert
