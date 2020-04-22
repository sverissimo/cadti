const
    { pool } = require('./config/pgConfig'),
    { veiculos } = require('./queries'),
    CronJob = require('cron').CronJob,
    moment = require('moment')

let i = 1, segurosVencidos = []

const job = new CronJob('0 * * * * *', function () {
    i++
    console.log(`You've seen this message ${i} times, once per minute. ${moment()}`);
}, null, true, 'America/Sao_Paulo');


pool.query(veiculos, (err, t) => {
    if (err) console.log(err)
    if (t && t.rows) {
        segurosVencidos = t.rows.filter(r => {
            if (r.vencimento && moment(r.vencimento).isValid()) {
                if (moment(r.vencimento).isAfter(moment())) return r
            }
        })
        console.log(segurosVencidos)
    }
})

module.exports = { job }

