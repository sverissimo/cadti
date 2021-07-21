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
        this.prazos = [0, 1]
        this.dbQuery = procuracoes
        this.messageIntro = 'As procurações abaixo se encontram próximas do vencimento:'
        this.mailFields = ['procuradores', 'vencimento']
        this.mailHeaders = ['Procuradores', 'Vencimento']
        this.messageTip = 'Para atualizar ou cadastrar uma nova procuração'
        this.tipPath = '\"Empresas\" >> \"Procuradores\".'
    }

    /**Filtra os itens (ex: apólice, procuração, etc) que estão a vencer por empresa, para concentrar todos de uma determinada empresa em um só e-mail.
    * @override
    * @param {Number} codigo_empresa Código da empresa/delegatário no banco de dados Posgresql
    * @returns Retorna uma array objetos, por ex: apólices de seguros ou procurações a vencer agrupadas por empresa
    */
    getEmpresaExpiringItems(codigo_empresa, expiringItems) {
        const expiringEmpresaItems = expiringItems
            .filter(a => a.codigo_empresa === codigo_empresa)
            .map((/** @type {{ any }} */ item) => {
                const obj = {}
                this.mailFields.forEach(f => Object.assign(obj, { [f]: item[f] }))
                this.addProcsName(obj)
                return obj
            })

        return expiringEmpresaItems
    }

    /**
    * Adiciona os nomes dos procuradores em um objeto que tenha array de procurador_id. Método específico para as subClasses que implementarem (ex: ProcuracaoAlert)
    * @param {object} expiringProcuracao - item a expirar (criado pelo método this.getEmpresaExpiringItems)
    */
    addProcsName(expiringProcuracao) {
        if (this.recipients) {
            const { procuradores } = this.recipients

            console.log("🚀 ~ file: ProcuracaoAlert.js ~ line 52 ~ ProcuracaoAlert ~ expiringProcuracao.procuradores.forEach ~ expiringProcuracao", expiringProcuracao)
            expiringProcuracao.procuradores.forEach((procId, i) => {
                const
                    procurador = procuradores.find(p => p.nome_procurador && p.procurador_id === procId)
                    , name = procurador && procurador.nome_procurador
                expiringProcuracao.procuradores[i] = name
            });
        }
        expiringProcuracao.procuradores = expiringProcuracao.procuradores.sort()
        return expiringProcuracao
    }
}

module.exports = ProcuracaoAlert
