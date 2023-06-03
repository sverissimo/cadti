//@ts-check
const templates = require('./templates')
const footer = require("./templates/footer")

class MessageBuilder {
    setRecipient(recipient) {
        this.recipient = recipient
        return this
    }

    setSubject(subject) {
        this.subject = subject
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
}

module.exports = { MessageBuilder }
