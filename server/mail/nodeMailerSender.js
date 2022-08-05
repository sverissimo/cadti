const createTransporter = require("./createTransporter")

async function nodeMailerSender({ to, subject, html }) {

    const transporter = await createTransporter()
    transporter.sendMail({
        from: 'Seinfra - CadTI',
        to,
        subject,
        html
    }, (err, info) => {
        if (err)
            console.log({ err })
        if (info)
            console.log({ info })
    })
    //console.log({ to, subject, html })
}

module.exports = nodeMailerSender

//const recipients = ['sandroverissimo@live.com','sverissimo2@gmail.com', 'sandro.verissimo@infraestrutura.mg.gov.br']