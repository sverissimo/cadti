//@ts-check
const { header, footer } = require("./templates")
const tableGenerator = require("./templates/tableGenerator")
const linkParaCadTI = require("./config/linkParaCadTI")

/**
 * Gera o html formatado para o envio de e-mails.
 * @param {Object} message - contém o vocativo e a mensagem, dividida em intro, tableData, tableHeader tip e tipPath *
 * @returns {String} html - retorna um html formatado em formato de string.
 */

function htmlGenerator({ vocativo, message }) {
    const { intro, tableData, tableHeaders, tip, tipPath, customFooter } = message
    const table = tableGenerator(tableData, tableHeaders)

    let html = `
    <html lang="pt-br">
        ${header}
        <h3>
            A/C ${vocativo}:
        </h3>
        <p>
            ${intro}
        </p>
        </br>
        <table>
            ${table}
        </table>
        </br>`
    if (tip) //Acrescenta orientação aou usuário se houver
        html += `
        <p>
            ${tip}, acesse ${linkParaCadTI} na opção ${tipPath}
        </p>
        `
    html += `

    ${customFooter || footer}
        </html>
        `
    return html
}

module.exports = htmlGenerator
