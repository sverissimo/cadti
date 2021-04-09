const MailMessage = require("./mailMessage")

class SeguroWarning extends MailMessage {

    constructor(apolice, razaoSocial) {
        super()
        this.subject = 'Vencimento de apólice de seguro se aproximando.'
        this.razaoSocial = razaoSocial
        this.apolice = apolice
    }
}

module.exports = SeguroWarning