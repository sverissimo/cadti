const
    { pool } = require('../config/pgConfig'),
    { veiculos } = require('../queries'),
    moment = require('moment')

const checkInsurances = () => {

    let segurosVencidos = []

    //Determinar veículos com seguros vencidos
    pool.query(veiculos, (err, t) => {
        if (err) console.log(err)
        if (t && t.rows) {
            segurosVencidos = t.rows.filter(r => {
                if (r.vencimento && moment(r.vencimento).isValid()) {
                    if (moment(r.vencimento).isBefore(moment())) return r
                }
            })
            segurosVencidos = segurosVencidos.map(s => s.veiculo_id)
            console.log('Seguros vencidos:', segurosVencidos)

            //Atualizar situação do veículo
            segurosVencidos.forEach(id => {
                const updateQuery = `
            UPDATE public.veiculos
            SET situacao = 'Seguro Vencido'
            WHERE veiculo_id = ${id}
            `
                console.log(id)
                pool.query(updateQuery, (err, t) => {
                    if (err) console.log(err)
                })
            })
        }
    })
}

module.exports = { checkInsurances }