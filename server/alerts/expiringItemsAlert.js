//@ts-check
const
    AlertFactory = require('./AlertFactory')
    , Recipients = require('./models/Recipients')
    , AlertService = require('./services/AlertService')
    , RecipientService = require('./services/RecipientService')

/**
 * Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas
 * @param {string} type - tipo de alerta a ser criado.
 * */
const expiringItemsAlert = async (type = 'laudos') => {

    const
        alertObject = new AlertFactory(type).createAlert(),
        subject = alertObject.subject,
        recipients = new Recipients(),
        alertService = new AlertService(alertObject),
        collection = await alertService.getCollection(),
        prazos = alertObject.prazos,

        expiringItems = alertService.checkExpiring(collection, prazos),
        empresasToNotify = alertService.getEmpresasToNotify(expiringItems)

    //Acrescenta recipients ao objeto pq o ProcuraracaoAlert (que implementa o método addProcsName) precisa para adicionar os nomes dos procuradores.
    alertObject.recipients = await new RecipientService().getAllRecipients()

    for (let empresa of empresasToNotify) {
        const
            { codigo_empresa, razao_social } = empresa,
            { to, vocativo } = recipients.setRecipients(codigo_empresa, razao_social, alertObject.recipients),
            expiringEmpresaItems = alertObject.getEmpresaExpiringItems(codigo_empresa, expiringItems),
            message = alertObject.createMessage(expiringEmpresaItems)

        alertService.mockAlert({ to, subject, vocativo, message })
        //alertService.saveAlert({ codigo_empresa, subject, vocativo, message })
        await new Promise(r => setTimeout(r, 2000));
    }
    return
}

//expiringItemsAlert()

module.exports = expiringItemsAlert