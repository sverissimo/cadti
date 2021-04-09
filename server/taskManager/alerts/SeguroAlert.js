//@ts-check

//**Classe instanciada de AlertClass com métodos específicos para o alerta sobre o vencimento de seguros 
const AlertClass = require("./alertClass")

class SeguroAlert extends AlertClass {

    apolices = []

    constructor() {
        super()
        this.prazos = [5, 8, 27, 29]
    }

    /**Obtém uma array de apólices */
    getApolices() {
        if (this.expiringItems)
            this.apolices = this.expiringItems.map(s => s.apolice)
    }

    createMessage() {
        if (this.apolices.length > 0)
            return `
        O seguro de apólice ${this.apolices.toString()} está prestes a vencer. Para atualizar ou cadastrar uma nova apólice, acesse
        linkParaCadTI na opção "Veículos" >> "Seguros".
        `
    }

}

module.exports = SeguroAlert