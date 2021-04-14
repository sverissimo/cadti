//@ts-check

const
    header = require("./templates/header"),
    footer = require("./templates/footer"),
    linkParaCadTI = require("./config/linkParaCadTI")

/**
 * Gera o html formatado para o envio de e-mails.
 * @param {Object} message - contém o vocativo e tipo de mensagem ou uma mensagem personalizada enviada do frontEnd(opcional)
 * O tipo de mensagem deve ser igual a um tipo constante no arquivo './messages.js' para retornar a mensagem por extenso.
 * @returns {String} html - retorna um html formatado em formato de string.
 */

function htmlGenerator({ vocativo, message }) {

    const { intro, details, tip, tipPath } = message

    const html = `
    <html lang="pt-br">
        ${header}
        <h3>
            A/C ${vocativo}:
        </h3>
        <p>
            ${intro}
        </p>
        <p>
            ${details}
        </p>
        <p>
            ${tip}, acesse ${linkParaCadTI} na opção ${tipPath}.
        </p>
        ${footer}
    </html>
    `

    return html
}

module.exports = htmlGenerator
