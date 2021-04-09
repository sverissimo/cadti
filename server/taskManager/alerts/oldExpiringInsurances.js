//@ts-check
const
    { pool } = require('../../config/pgConfig'),
    moment = require('moment'),
    { seguros: allSeguros } = require('../../queries'),
    sendMail = require('../../mail/sendMail'),
    setRecipients = require('./setRecipients')


/**Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas*/
const warnExpiringInsurances = async () => {

    const
        seg = await pool.query(allSeguros),
        seguros = seg.rows

    //Verifica seguros com vencimento em 15 dias    
    const expiringSeguros = seguros.filter(s => {
        const
            warningDate = moment().add(85, 'days'),
            vencendo = moment(s.vencimento).isSame(warningDate, 'days')

        /* **********************ADICIONAR OUTROS PRAZOS PARA ALERTA **************************
            warningDate2 = moment().add(9, 'days'),
            vencendo = moment(s.vencimento).isSame(warningDate, 'days') || moment(s.vencimento).isSame(warningDate2, 'days')
        *****************************************************************************************/
        return vencendo
    })

    const a = await setRecipients(expiringSeguros)
    console.log(a)
    //sendMail({ data: expiringSeguros, type: 'expiringSeguros' })

}

warnExpiringInsurances()
//module.exports = warnExpiringInsurances