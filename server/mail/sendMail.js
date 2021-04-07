const nodemailer = require("nodemailer")
const fs = require('fs')

async function main() {

  const x = fs.readFileSync('./seguroExpiring.html', (err, doc) => {
    console.log(err)
  })
  const htmlMail = x && x.toString()

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
      user: 'seinframg20@gmail.com', // generated ethereal user
      pass: '!!s3iNfr@', // generated ethereal password
    }
  })

  let info = await transporter.sendMail({
    from: 'CadTI', // sender address
    //to: 'sandroverissimo@live.com',
    //to: 'sverissimo2@gmail.com',
    to: "sandro.verissimo@infraestrutura.mg.gov.br", // list of receivers
    subject: "Whatup, svom!!!??", // Subject line    
    html: htmlMail // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);