//@ts-check

const
    sendMail = require("../../mail/sendMail")
    , RecipientService = require("../services/RecipientService")

/**
 * Entidade de alerta de usuário
 */
class UserAlert {

    /**
     * @property {number} codigo_empresa - Código da empresa (padrão = 1, convenção que significa todas as empresas)
     */
    codigo_empresa = 1
    /**
     * 
     * @property {string} vocativo - Nome da empresa ( padrão = "Todos os delegatários")
     */
    vocativo = "Todos os delegatários"

    /**     
     * @param {object} alertObject - Objeto contendo as props para criar o alert.
     */
    constructor(alertObject) {
        const { from, to, subject, vocativo, message, codigo_empresa } = alertObject
        this.from = from
        this.to = to
        this.subject = subject
        this.vocativo = vocativo || this.vocativo
        this.message = message
        this.codigo_empresa = codigo_empresa || this.codigo_empresa
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