const fs = require('fs')

/**@param{any} Object with to, subject and html props*/
async function testMailSender({ to, subject, html }) {
    to = to.replace('.', '')
    const fileName = `./fakeEmail_${to}.html`

    fs.writeFileSync(fileName, html, () => console.log('created html alright -> ', to))
}

module.exports = testMailSender
