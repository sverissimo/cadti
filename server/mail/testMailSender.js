const fs = require('fs')
const MailMessage = require('./models/mailMessage')
const SeguroWarning = require('./models/seguroWarning')

async function testMailSender({ to, subject, html, socios }) {

    console.log(socios)

    let
        i = '',
        fileName = `./fakeEmail${i}.html`,
        exists = fs.existsSync(fileName)

    while (exists) {
        i++
        fileName = `./fakeEmail${i}.html`
        exists = fs.existsSync(fileName)
    }

    const s = new SeguroWarning()
    //console.log(s)


    /*     const
            tst = new MailMessage(),
            getSeguros = await tst.getSeguros(),
            seguros = getSeguros.rows
        console.log(seguros) */
    //console.log(tst.getSeguros())
    //console.log(tst.getSeguros())
    //fs.writeFile(fileName, html, () => console.log('created html alright'))
}

module.exports = testMailSender

//const recipients = ['sandroverissimo@live.com','sverissimo2@gmail.com', 'sandro.verissimo@infraestrutura.mg.gov.br']