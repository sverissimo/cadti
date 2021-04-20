//@ts-check
const header = require("./templates/header")


/**
* Gera o html formatado para o envio de e-mails.
* @param {string} vocativo
* @param {string} message - contém o texto do e-mail
* @returns {String} html - retorna um html formatado em formato de string.
*/
function simpleMsgGenerator(vocativo, message, footer = '') {

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

module.exports = simpleMsgGenerator
