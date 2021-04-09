const
    { pool } = require('../../config/pgConfig'),
    moment = require('moment'),
    { socios: allSocios, seguros: allSeguros } = require('../../queries'),
    sendMail = require('../../mail/sendMail')

/**Identifica seguros prestes a vencer e chama o método ../mail/mailSender para enviar alertas*/
const warnExpiringInsurances = async () => {

    let
        seguros = seg.rows,
        socios = soc.rows,
        procuradores = proc.rows

    //Verifica seguros com vencimento em 15 dias    
    expiringSeguros = seguros.filter(s => {
        const
            warningDate = moment().add(22, 'days'),
            vencendo = moment(s.vencimento).isSame(warningDate, 'days')

        /* **********************ADICIONAR OUTROS PRAZOS PARA ALERTA **************************
            warningDate2 = moment().add(9, 'days'),
            vencendo = moment(s.vencimento).isSame(warningDate, 'days') || moment(s.vencimento).isSame(warningDate2, 'days')
        *****************************************************************************************/
        return vencendo
    })
    sendMail({ data: expiringSeguros, type: 'expiringSeguros' })

    //console.log(expiringSeguros.map(s => { return { a: s.apolice, date: s.vencimento } }))
    //console.log(expiringSeguros)


}

warnExpiringInsurances()
//module.exports = warnExpiringInsurances