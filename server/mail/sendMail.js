//@ts-check
const
  nodeMailerSender = require("./nodeMailerSender"),
  htmlGenerator = require("./htmlGenerator")
//,testMailSender = require("./testMailSender")


/**
 * Formata a mensagem chamando a função htmlGenerator e envia e-mail utilizando o nodeMailer
 * @params {Object}  objeto com as props { to, subject, vocativo, message }
 * A data é para pegar a razão social e o código da empresa e dai formar o to e o vocativo
 */
async function sendMail({ to, subject, vocativo, message }) {

  const html = htmlGenerator({ vocativo, message })

  try {
    await nodeMailerSender({ to: 'sverissimo2@gmail.com', subject, html })
    //await console.log({ to: 'sverissimo2@gmail.com', subject, html })
  }
  catch (error) {
    console.log(error)
  }

}

//testMailSender({ vocativo, html })  
//autoCall for testing purposes
//main().catch(console.error);

module.exports = sendMail