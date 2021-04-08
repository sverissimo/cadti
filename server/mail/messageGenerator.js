const
    header = require("./templates/header"),
    footer = require("./templates/footer"),
    messages = require("./templates/messages")


function messageGenerator(mailContent) {

    const { vocativo, messageType } = mailContent
    let message = mailContent.message

    if (!message)
        message = messages[messageType]

    const html = `
    <html lang="pt-br">
        ${header}
        <h3>
            A/C ${vocativo}:
        </h3>
        <p>
            ${message}
        </p>
        ${footer}
    </html>
    `

    return html
}

module.exports = messageGenerator
