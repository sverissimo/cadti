//@ts-check
const
    fs = require('fs')
    , path = require('path')
    , htmlGenerator = require('../../mail/htmlGenerator')
    , AlertRepository = require('../repositories/AlertRepository')

/**
 * Classe responsável por gerenciar e oferecer serviços de envio (ex: email) e armazenamento de alertas, além de método de testes. 
 */
class AlertService {

    mockAlert({ to, subject, vocativo, message, html = null }) {

        vocativo = vocativo
            .replace(/\./g, '')
            .replace(/\//g, '')

        html = htmlGenerator({ vocativo, message })
            + '<br /><h5>Raw data:</h5>'
            + JSON.stringify(message)

        const
            filePath = path.join(__dirname, '..', 'mockAlertFiles')
            , fileName = filePath + `\\fakeEmail_${vocativo}.html`

        fs.writeFileSync(fileName, html)

        console.log("🚀 ~ file: AlertService.js ~ line 15 ~ mockAlert ~ to, subject, vocativo", { fileName, to, vocativo, subject })
        return 'alright.'
    }

    saveAlert({ codigo_empresa, subject, vocativo, message }) {
        const
            alertObject = { codigo_empresa, subject, vocativo, message: JSON.stringify(message) }
            , alertRepository = new AlertRepository()

        alertRepository.save(alertObject)
    }
}

module.exports = AlertService

