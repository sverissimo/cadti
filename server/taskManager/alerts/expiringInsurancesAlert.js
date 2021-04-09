//@ts-check
const
    sendMail = require('../../mail/sendMail'),
    setRecipients = require('./setRecipients'),
    { seguros: allSeguros } = require('../../queries'),
    AlertsClass = require('./alertsClass')


/**Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas*/
const expiringInsurancesAlert = async () => {

    const
        seguroAlert = new AlertsClass(),
        seguros = await seguroAlert.getCollection(allSeguros),
        expiring = seguroAlert.checkExpiring(seguros)

    console.log(expiring)


    //    const a = await setRecipients(expiringSeguros)
    //  console.log(a)
    //sendMail({ data: expiringSeguros, type: 'expiringSeguros' })

}

//expiringInsurancesAlert()
module.exports = expiringInsurancesAlert