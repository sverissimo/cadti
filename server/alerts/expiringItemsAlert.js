//@ts-check
const
    sendMail = require('../mail/sendMail'),
    AlertFactory = require('./AlertFactory'),
    Recipients = require('./Recipients')
const AlertService = require('./services/AlertService')

/**
 * Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas
 * @param {string} type - tipo de alerta a ser criado.
 * */
const expiringItemsAlert = async (type = 'laudos') => {

    const
        alertObject = new AlertFactory(type).createAlert(),
        subject = alertObject.subject,
        recipients = new Recipients(),
        collection = await alertObject.getCollection(),
        prazos = alertObject.prazos,

        expiringItems = alertObject.checkExpiring(collection, prazos),
        empresas = alertObject.getEmpresas(expiringItems)

    //Acrescenta recipients ao objeto pq o ProcuraracaoAlert (que implementa o método addProcsName) precisa para adicionar os nomes dos procuradores.
    alertObject.recipients = await recipients.getAllRecipients()


    for (let empresa of empresas) {
        const
            { codigo_empresa, razao_social } = empresa,
            { to, vocativo } = recipients.setRecipients(codigo_empresa, razao_social),
            expiringEmpresaItems = alertObject.getEmpresaExpiringItems(codigo_empresa),
            message = alertObject.createMessage(expiringEmpresaItems),
            alertService = new AlertService()

        await alertService.mockAlert({ to, subject, vocativo, message })
        await new Promise(r => setTimeout(r, 2000));
    }
    return
}

//expiringItemsAlert()

module.exports = expiringItemsAlert