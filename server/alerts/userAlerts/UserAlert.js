//@ts-check

const
    sendMail = require("../../mail/sendMail")
    , RecipientService = require("../services/RecipientService")


/**
 * Entidade de alerta de usuário
 */
class UserAlert {

    /**
     * 
     * @param {object} alertObject - Objeto contendo as props para criar o alert.
     */
    constructor(alertObject) {
        const { from, to, subject, vocativo, message } = alertObject
        this.from = from
        this.to = to
        this.subject = subject
        this.vocativo = vocativo
        this.message = message

    }

    /**
     * Método para enviar o alerta por e-mail.
     */
    async sendMessage() {
        if (!this.message || !this.to)
            throw new Error('É preciso haver um remetente e uma mensagem.')
        if (this.to === 'all') {
            const allUsers = await new RecipientService().getAllRecipients()
            this.to = allUsers
        }
        sendMail({ to: this.to, subject: this.subject, vocativo: this.vocativo, message: this.message, footer: true })
    }
}

module.exports = UserAlert