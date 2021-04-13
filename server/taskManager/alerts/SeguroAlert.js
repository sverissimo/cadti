//@ts-check
const AlertClass = require("./alertClass")
const moment = require('moment')

//**Classe instanciada de AlertClass com métodos específicos para o alerta sobre o vencimento de seguros 
class SeguroAlert extends AlertClass {

    apolices = []

    constructor() {
        super()
        this.subject = 'Vencimento de apólices de seguro.'
        this.prazos = [5, 8, 27, 29]
    }

    /**Obtém uma array de apólices */
    getExpiringApolices(codigo_empresa) {

        this.apolices = this.expiringItems
            .filter(a => a.codigo_empresa === codigo_empresa)
            .map(({ apolice, vencimento, segurados }) => ({ apolice, vencimento, segurados }))

        return this.apolices

    }

    createMessage({ apolices }) {
        if (apolices.length > 0) {
            let relacaoDeApolices = ''
            apolices.forEach(({ apolice, vencimento, segurados }) => {
                const dataVencimento = moment(vencimento).format('DD/MM/YYYY')
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
