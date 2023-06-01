//@ts-check
const simpleMsgGenerator = require('./simpleMsgGenerator')
const templates = require('./templates')
const testMailSender = require('./testMailSender')

class MailService {
    constructor(user, mailService) {
        this.user = user
        this.message = {}
        this.mailService = mailService || testMailSender
    }

    createMessage(subject) {
        const content = this.messageFactory(subject)

        const messageBuilder = new MessageBuilder()
        messageBuilder
            .setRecipient(this.user.email)
            .setSubject(subject)
            .setMessage(content)

        this.message = messageBuilder.build()
        return this
    }

    messageFactory = (subject) => {
        if (subject in templates) {
            console.log("🚀 ~ file: MailService.js:29 ~ MailService ~ templates[subject]:", templates[subject](this.user))
            return templates[subject](this.user)
        }
        return '**** something wrong...'
    }

    sendMessage(sender) {
        const { message } = this.message
        const { name: vocativo } = this.user
        const html = simpleMsgGenerator(vocativo, message, true)
        this.mailService({ vocativo, html })
        return this
    }
}


class MessageBuilder {
    setRecipient(recipient) {
        this.recipient = recipient
        return this
    }

    setSubject(subject) {
        this.subject = subject
        return this
    }

    setMessage(message) {
        this.message = message
        return this
    }

    build() {
        return {
            to: this.recipient,
            subject: this.subject,
            message: this.message,
        }
    }
}

module.exports = { MailService }
