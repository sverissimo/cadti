const fs = require('fs')


async function testMailSender({ to, subject, html }) {

    console.log({ to, subject })
    fs.writeFile('./fakeEmail.html', html, () => console.log('created html alright'))

}

module.exports = testMailSender

//const recipients = ['sandroverissimo@live.com','sverissimo2@gmail.com', 'sandro.verissimo@infraestrutura.mg.gov.br']