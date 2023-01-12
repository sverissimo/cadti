//@ts-check
const
    { pool } = require('../../config/pgConfig'),
    { seguros } = require('../../infrastructure/SQLqueries/queries'),
    moment = require('moment')

//Determinar os seguros vencidos e atualizar seus status
const checkExpiredInsurances = async () => {
    console.log(1)
    let idsVencidos = []
    const
        s = await pool.query(seguros),
        segurosTable = s.rows

    segurosTable.forEach(s => {
        const
            vencido = moment(s.vencimento).isBefore(moment(), 'day'),
            atualizar = s.situacao !== 'Vencido'

        if (vencido && atualizar)
            idsVencidos.push(s.id)
    })
    console.log(idsVencidos)
    idsVencidos.forEach(id => {
        const upQuery = `
        UPDATE seguros
        SET situacao = 'Vencido'
        WHERE id = ${id}
        `
        pool.query(upQuery, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows) console.log(t.rows)
        })
    })
    //console.log('checkExpiredInsurances: updated expired insurances')
    return
}

module.exports = checkExpiredInsurances