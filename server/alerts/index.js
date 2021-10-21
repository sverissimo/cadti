//@ts-check

const
    AlertFactory = require('./AlertFactory')
    , AlertService = require('./services/AlertService')
    , RecipientService = require('./services/RecipientService')

/** 
 * @file index.js é o ponto de entrada do micro serviço de geração de alertas/avisos. Os alertas podem ser gerados e salvos no banco de dados MongoDB ou enviados por e-mail, conforme os métodos/serviços selecionados
 * @author Sandro Veríssimo 
 */


/**
* Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas
* @param {string} type - tipo de alerta a ser criado.
* */
const main = async (type = 'laudos') => {


    const
        alertObject = await new AlertFactory(type).createAlert()
        , subject = alertObject.subject
        , from = alertObject.from
        , recipientService = new RecipientService()
        , alertService = new AlertService(alertObject)
        , collection = await alertService.getCollection()
        , prazos = alertObject.prazos

        , expiringItems = alertService.checkExpiring(collection, prazos)
        , empresasToNotify = alertService.getEmpresasToNotify(expiringItems)
        , adminEmails = await recipientService.getAdminEmails()
        , allMessages = []


    //Acrescenta recipients ao objeto pq o ProcuraracaoAlert (que implementa o método addProcsName) precisa para adicionar os nomes dos procuradores.
    alertObject.recipients = await recipientService.getAllRecipients()

    for (let empresa of empresasToNotify) {
        const
            { codigo_empresa, razao_social } = empresa,
            { to, vocativo } = recipientService.setRecipients(codigo_empresa, razao_social, alertObject.recipients),
            expiringEmpresaItems = alertObject.getEmpresaExpiringItems(codigo_empresa, expiringItems),
            message = alertObject.createMessage(expiringEmpresaItems),
            { tip, tipPath, ...data } = message

        allMessages.push({ ...data, subject, vocativo })

        //alertService.mockAlert({ to, subject, vocativo, message })
        alertService.saveAlert({ codigo_empresa, from, subject, vocativo, message })
        await new Promise(r => setTimeout(r, 2000));
    }
    //Aguarda 2min para enviar o alerta para os Admins, o que equivale a 60 loops acima, equivalente a 60 empresas notificadas
    /* setTimeout(() => {
        alertService.sendAlertsToAdmin(allMessages, adminEmails)
    }, 120000); */
    return
}

module.exports = main
