//@ts-check
const
    sendMail = require('../../mail/sendMail'),
    setRecipients = require('./setRecipients'),
    AlertFactory = require('./AlertFactory')

/**
 * Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas*/
const expiringItemsAlert = async (type = 'laudos') => {

    const
        alertObject = new AlertFactory(type).createAlert(),
        subject = alertObject.subject,
        collection = await alertObject.getCollection(),
        prazos = alertObject.prazos,

        expiringItems = alertObject.checkExpiring(collection, prazos),
        empresas = alertObject.getEmpresas(expiringItems)

    console.log("🚀 ~ file: expiringItemsAlert.js ~ line 19 ~ expiringItemsAlert ~ empresas", empresas)
    //console.log("🚀 ~ file: expiringItemsAlert.js ~ line 15 ~ expiringItemsAlert ~   collection", expiringItems)

    for (let empresa of empresas) {
        const
            { codigo_empresa, razao_social } = empresa,
            { to, vocativo } = await setRecipients(codigo_empresa, razao_social),
            expiringEmpresaItems = alertObject.getEmpresaExpiringItems(codigo_empresa),
            message = alertObject.createMessage(expiringEmpresaItems)

        await sendMail({ to, subject, vocativo, message })
        await new Promise(r => setTimeout(r, 2000));
    }
    return
}

expiringItemsAlert()

module.exports = expiringItemsAlert