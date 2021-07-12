//@ts-check

const
    Alert = require("./Alert"),
    { procuracoes: getAllProcs } = require("../../allGetQueries"),
    procuracoes = getAllProcs()


class ProcuracaoAlert extends Alert {

    /** @type {{ procuradores: any[]; }} */
    recipients;

    constructor() {
        super()
        this.subject = 'Vencimento de procurações.'
        this.prazos = [1]
        this.dbQuery = procuracoes
        this.messageIntro = 'As procurações abaixo se encontram próximas do vencimento:'
        this.mailFields = ['procuradores', 'vencimento']
        this.mailHeaders = ['Procuradores', 'Vencimento']
        this.messageTip = 'Para atualizar ou cadastrar uma nova procuração'
        this.tipPath = '\"Empresas\" >> \"Procuradores\".'
    }

    addProcsName(expiringProcuracao) {
        if (this.recipients) {
            const { procuradores } = this.recipients

            expiringProcuracao.procuradores.forEach((procId, i) => {
                const name = procuradores
                    .find(p => p.nome_procurador && p.procurador_id === procId)
                    .nome_procurador
                expiringProcuracao.procuradores[i] = name
            });
        }
        expiringProcuracao.procuradores = expiringProcuracao.procuradores.sort()
        return expiringProcuracao
    }

}

module.exports = ProcuracaoAlert
