const
  nodeMailerSender = require("./nodeMailerSender"),
  htmlGenerator = require("./htmlGenerator"),
  testMailSender = require("./testMailSender")


/**Envia e-mail utilizando o nodeMailer
 * @params{object} -  options é um objeto com as props type e data
 * A data é para pegar a razão social e o código da empresa e dai formar o to e o vocativo
 */
async function sendMail(data) {

  options = options || { subject: 'a', to: 'b' }

  const
    { subject, to } = options,
    mailContent = { vocativo: 'Delegatário', messageType: 'seguroVencendo' },
    html = htmlGenerator(mailContent)

  testMailSender({ subject, to, html, socios })
  //const messageInfo = await nodeMailerSender({ subject, to, html }).then(r => console.log(r))
}

//autoCall for testing purposes
//main().catch(console.error);

module.exports = sendMail