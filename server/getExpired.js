const
    { pool } = require('./config/pgConfig'),
    { veiculos } = require('./queries'),
    moment = require('moment')

let segurosVencidos = []

const getExpired = (req, res) => {
    pool.query(veiculos, (err, t) => {
        if (err) console.log(err)
        if (t && t.rows) {
            segurosVencidos = t.rows.filter(r => {
                if (r.vencimento && moment(r.vencimento).isValid()) {
                    if (moment(r.vencimento).isAfter(moment()) && r.veiculo_id) return r
                }
            })
            segurosVencidos = segurosVencidos.map(v => v.veiculo_id)
            console.log(segurosVencidos)
            res.json(segurosVencidos)
        }
    })
    
}

module.exports = { getExpired }
