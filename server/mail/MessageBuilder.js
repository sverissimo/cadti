//@ts-check
const templates = require('./templates')
const footer = require("./templates/footer")

class MessageBuilder {
    setRecipient(recipient) {
        this.recipient = recipient
        return this
    }

    setSubject(subject) {
        this.subject = this._createEmailSubject(subject)
        return this
    }

    createMessage = ({ subject, user }) => {
        this.message = templates[subject](user)
        return this
    }

    setFooter(customFooter) {
        this.message += customFooter || footer
        return this
    }

    build() {
        return {
            to: this.recipient,
            subject: this.subject,
            message: this.message,
        }
    }

    _createEmailSubject(subject) {
        let emailSubject = ''
        switch (subject) {
            case 'confirmEmailTemplate':
                emailSubject = 'Confirmação de e-mail'
                break;
            case 'newUserTemplate':
                emailSubject = 'Novo usuário criado no CadTI'
                break;
            case 'retrievePassTemplate':
                emailSubject = 'Instruções para recuperação de senha'
                break;
            default: return ''
        }
        return emailSubject
    }
}

module.exports = { MessageBuilder }
