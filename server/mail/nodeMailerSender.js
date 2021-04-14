const
    nodemailer = require("nodemailer"),
    mailConfig = require("./config/mailConfig")


async function nodeMailerSender({ to, subject, html }) {

    let transporter = nodemailer.createTransport(mailConfig)

    let info = await transporter.sendMail({
        from: 'Seinfra - CadTI',
        to,
        subject,
        html
    })
    console.log("Message sent: %s", info, info.messageId);
    return info
}

module.exports = nodeMailerSender
