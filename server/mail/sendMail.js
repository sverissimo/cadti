const
  nodeMailerSender = require("./nodeMailerSender"),
  messageGenerator = require("./messageGenerator"),
  testMailSender = require("./testMailSender")

/**@params
 * options é um objeto com as props subject, to e mailContent
 */
async function main(options) {
  options = options || { subject: 'a', to: 'b' }

  const
    { subject, to } = options,
    mailContent = { vocativo: 'Delegatário', messageType: 'seguroVencendo' },
    html = messageGenerator(mailContent)

  testMailSender({ subject, to, html })
  //const messageInfo = await nodeMailerSender({ subject, to, html }).then(r => console.log(r))


}

main().catch(console.error);