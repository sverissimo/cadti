//@ts-check

const
    Alert = require("./Alert"),
    { procuracoes: getAllProcs } = require("../../allGetQueries"),
    procuracoes = getAllProcs()


class ProcuracaoAlert extends Alert {

    constructor() {
        super()
        this.subject = 'Vencimento de procurações.'
        this.prazos = [3]
        this.dbQuery = procuracoes
    }

    getEmpresaExpiringItems(codigo_empresa) {
        console.log("🚀 ~ file: ProcuracaoAlert.js ~ line 23 ~ ProcuracaoAlert ~ getEmpresaExpiringItems ~ this.expiringItems", this.expiringItems)
        const
            expiringProcs = this.expiringItems
                .filter(el => el.codigo_empresa === codigo_empresa)
                .map(({ vencimento, procuradores }) => ({ vencimento, procuradores }))

        return expiringProcs
    }

    createMessage(procuracoes) {
        if (procuracoes.length > 0) {
            let relacaoDeProcuracoes = ''
            procuracoes.forEach(({ vencimento, procuradores }) => {
                const dataVencimento = super.formatDate(vencimento)
                relacaoDeProcuracoes += `
                    Vencimento da procuracao: ${dataVencimento}, procuradores: ${procuradores}
    
                    `
            })
            const message = {
                intro: 'As procurações abaixo se encontram próximas do vencimento:',
                details: relacaoDeProcuracoes,
                tip: 'Para atualizar ou cadastrar uma nova procuração',
                tipPath: '\"Empresas\" >> \"Procuradores\".'
            }
            return message
        }
    }
}

module.exports = ProcuracaoAlert
