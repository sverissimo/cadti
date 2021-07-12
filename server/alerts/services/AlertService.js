//@ts-check
const fs = require('fs')
const path = require('path')

class AlertService {

    mockAlert({ to, subject, message, html = null, vocativo }) {

        vocativo = vocativo
            .replace(/\./g, '')
            .replace(/\//g, '')

        const
            filePath = path.join(__dirname, '..', 'mockAlertFiles')
            , fileName = filePath + `\\fakeEmail_${vocativo}.html`

        console.log(fileName)
        console.log("🚀 ~ file: AlertService.js ~ line 1 ~ AlertService ~ mockAlert ~ process.cwd()", filePath)

        fs.writeFileSync(fileName, html)

        console.log("🚀 ~ file: AlertService.js ~ line 15 ~ mockAlert ~ to, subject, vocativo", { to, vocativo, subject })
        return 'alright.'
    }
}

module.exports = AlertService

