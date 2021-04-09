//@ts-check
const
    sendMail = require('../../mail/sendMail'),
    setRecipients = require('./setRecipients'),
    { seguros: allSeguros } = require('../../queries'),
    SeguroAlert = require('./SeguroAlert')



/**Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas*/
const expiringInsurancesAlert = async () => {

    const
        seguroAlert = new SeguroAlert(),
        seguros = await seguroAlert.getCollection(allSeguros),
        prazos = seguroAlert.prazos

    seguroAlert.checkExpiring(seguros, prazos)
    seguroAlert.getApolices()

    console.log(seguroAlert.createMessage())


    //    const a = await setRecipients(expiringSeguros)
    //  console.log(a)
    //sendMail({ data: expiringSeguros, type: 'expiringSeguros' })

}

//expiringInsurancesAlert()
module.exports = expiringInsurancesAlert