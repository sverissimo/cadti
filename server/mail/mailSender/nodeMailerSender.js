const createTransporter = require("./createTransporter")

/**@param{any} Object with to, subject and html props*/
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
}

module.exports = nodeMailerSender
