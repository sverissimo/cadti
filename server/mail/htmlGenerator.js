//@ts-check

const
    header = require("./templates/header"),
    footer = require("./templates/footer"),
    linkParaCadTI = require("./config/linkParaCadTI"),
    tableGenerator = require("./templates/tableGenerator")

/**
 * Gera o html formatado para o envio de e-mails.
 * @param {Object} message - contém o vocativo e a mensagem, dividida em intro, tableData, tableHEader tip e tipPath
 * Ver classe Alert.js em ../alerts
 * @returns {String} html - retorna um html formatado em formato de string.
 */

function htmlGenerator({ vocativo, message }) {

    const
        { intro, tableData, tableHeaders, tip, tipPath } = message,
        table = tableGenerator(tableData, tableHeaders)

    const html = `
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
        </br>
        <p>
            ${tip}, acesse ${linkParaCadTI} na opção ${tipPath}
        </p>
        ${footer}
    </html>
    `

    return html
}

module.exports = htmlGenerator
