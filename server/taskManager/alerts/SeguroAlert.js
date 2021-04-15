//@ts-check
const Alert = require("./Alert")
const { seguros } = require("../../queries")

//**Classe instanciada de Alert com métodos específicos para o alerta sobre o vencimento de seguros 
class SeguroAlert extends Alert {

    apolices = []

    constructor() {
        super()
        this.subject = 'Vencimento de apólices de seguro.'
        this.prazos = [5, 8, 27, 76, 77]
        this.dbQuery = seguros
    }

    getEmpresaExpiringItems(codigo_empresa) {
        this.apolices = this.expiringItems
            .filter(a => a.codigo_empresa === codigo_empresa)
            .map(({ apolice, vencimento, segurados }) => ({ apolice, vencimento, segurados }))

        return this.apolices
    }


    createMessage(apolices) {
        if (apolices.length > 0) {
            let relacaoDeApolices = ''
            apolices.forEach(({ apolice, vencimento, segurados }) => {
                const dataVencimento = super.formatDate(vencimento)
                relacaoDeApolices += `
                    Número da apólice: ${apolice}, vencimento: ${dataVencimento}, veículos segurados: ${segurados}

                    `
            })
            const message = {
                intro: 'O(s) seguro(s) listado(s) abaixo se encontra(m) próximos do vencimento:',
                details: relacaoDeApolices,
                tip: 'Para atualizar ou cadastrar uma nova apólice',
                tipPath: '\"Veículos\" >> \"Seguros\".'
            }
            return message
        }
    }
}

module.exports = SeguroAlert
