//@ts-check

const
    Alert = require("./Alert"),
    { procuracoes: getAllProcs } = require("../../allGetQueries"),
    procuracoes = getAllProcs()


class ProcuracaoAlert extends Alert {

    constructor() {
        super()
        this.subject = 'Vencimento de procurações.'
        this.prazos = [2]
        this.dbQuery = procuracoes
        this.messageIntro = 'As procurações abaixo se encontram próximas do vencimento:'
        this.mailFields = ['procuradores', 'vencimento']
        this.mailHeaders = ['Procuradores', 'Vencimento']
        this.messageTip = 'Para atualizar ou cadastrar uma nova procuração'
        this.tipPath = '\"Empresas\" >> \"Procuradores\".'
    }
}

module.exports = ProcuracaoAlert
