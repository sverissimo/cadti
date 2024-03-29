//@ts-check
const { MessageBuilder } = require('./MessageBuilder')
const simpleMsgGenerator = require('./simpleMsgGenerator')

class MailService {

    constructor(mailSender) {
        this.message = {}
        this.mailSender = mailSender
    }

    setUser = (user) => {
        this.user = user
        return this
    }

    createMessage = (subject) => {
        const messageBuilder = new MessageBuilder()

        messageBuilder
            .setRecipient(this.user.email)
            .setSubject(subject)
            .createMessage({ subject, user: this.user })

        this.message = messageBuilder.build()
        return this
    }

    sendMessage = async () => {
        const { message, subject } = this.message
        const { name, email } = this.user
        const html = simpleMsgGenerator(name, message, true)
        await this.mailSender({ to: email, subject, html })
        return this
    }
}

module.exports = { MailService }
