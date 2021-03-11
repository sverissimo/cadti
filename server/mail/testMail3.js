"use strict";
const SMTPConnection = require("nodemailer/lib/smtp-connection");
let connection = new SMTPConnection({ secure: false });

async function main() {

    const
        envelope = {
            from: 'foo@example.com', // sender address
            to: "sandro.verissimo@infraestrutura.mg.gov.br", // list of receivers
        },
        message = 'Testando e-mails cadTI...'

    connection.connect(err => {
        if (err)
            console.log(err)
    })

    connection.send(envelope, message, (err, info) => {
        if (err)
            console.log(err)
        else
            console.log(info)
    })
}

main()