//@ts-check
const htmlGenerator = require("./htmlGenerator")
const { nodeMailerSender, testMailSender } = require("./mailSender")
const simpleMsgGenerator = require("./simpleMsgGenerator")

/**
 * Formata a mensagem chamando a função htmlGenerator e envia e-mail utilizando o nodeMailer
 * @params {Object}  objeto com as props { to, subject, vocativo, message }
 * A data é para pegar a razão social e o código da empresa e dai formar o to e o vocativo
 */
async function sendMail({ to, subject, vocativo, message, footer = null, sendMail = false }) {

  let html
  if (typeof message === 'object')
    html = htmlGenerator({ vocativo, message })
  else
    html = simpleMsgGenerator(vocativo, message, footer)

  if (sendMail)
    nodeMailerSender({ to, subject, html })
  else
    testMailSender({ to: vocativo, html })
}

module.exports = sendMail
