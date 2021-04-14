//@ts-check
const
    sendMail = require('../../mail/sendMail'),
    setRecipients = require('./setRecipients'),
    { seguros: allSeguros } = require('../../queries'),
    SeguroAlert = require('./SeguroAlert')


/**
 * Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas*/
const expiringInsurancesAlert = async () => {

    const
        seguroAlert = new SeguroAlert(),
        subject = seguroAlert.subject,
        seguros = await seguroAlert.getCollection(allSeguros),
        prazos = seguroAlert.prazos,

        segurosVencendo = seguroAlert.checkExpiring(seguros, prazos),
        empresas = seguroAlert.getEmpresas(segurosVencendo)

    console.log("🚀 ~ file: expiringInsurancesAlert.js ~ line 19 ~ expiringInsurancesAlert ~ empresas", empresas)

    for (let empresa of empresas) {
        const
            { codigo_empresa, razao_social } = empresa,
            { to, vocativo } = await setRecipients(codigo_empresa, razao_social),
            apolices = seguroAlert.getExpiringApolices(codigo_empresa),
            message = seguroAlert.createMessage({ apolices })

        sendMail({ to, subject, vocativo, message })
        await new Promise(r => setTimeout(r, 2000));
    }
}

expiringInsurancesAlert()

module.exports = expiringInsurancesAlert