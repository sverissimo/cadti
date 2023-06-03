//@ts-check
const header = require("./templates/header")
const footer = require("./templates/footer")

/**
* Gera o html formatado para o envio de e-mails.
* @param {string} name
* @param {string} message - contém o texto do e-mail
* @returns {String} html - retorna um html formatado em formato de string.
*/
function simpleMsgGenerator(name, message, addFooter) {

    const html = `
    <html lang="pt-br">
        ${header}
        <h3>
            A/C ${name}:
        </h3>
        <p>
        ${message}
        </p>
        ${addFooter && footer}
    </html>
    `

    return html
}

module.exports = simpleMsgGenerator
