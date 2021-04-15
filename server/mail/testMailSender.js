const fs = require('fs')

function testMailSender({ html, vocativo }) {

    const fileName = `./fakeEmail_${vocativo}.html`
    console.log(fileName)

    fs.writeFileSync(fileName, html, () => console.log('created html alright -> ', vocativo))
    return 'alright.'
}

module.exports = testMailSender

//const recipients = ['sandroverissimo@live.com','sverissimo2@gmail.com', 'sandro.verissimo@infraestrutura.mg.gov.br']