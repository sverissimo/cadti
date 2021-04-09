const
    header = require("./templates/header"),
    footer = require("./templates/footer"),
    messages = require("./templates/messages")

/**Gera o html formatado para o envio de e-mails.
 * @param{object} mailContent - contém o vocativo e tipo de mensagem ou uma mensagem personalizada enviada do frontEnd(opcional)
 * O tipo de mensagem deve ser igual a um tipo constante no arquivo './messages.js' para retornar a mensagem por extenso.
 * @yields{string} - retorna um html formatado em formato de string.
 */

function htmlGenerator(mailContent) {

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

module.exports = htmlGenerator
