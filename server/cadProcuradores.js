const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadProcuradores = (req, res) => {

    const procuradores = parseRequestBody(req.body.procuradores)

    procuradores.forEach(async p => {
        const { keys, values } = p
        await pool.query(`INSERT INTO public.procurador (${keys}) VALUES (${values})`, (err, table) => {
            if (err) res.send(err)
        })
        console.log('ok')
    })

    let procArray = [],
        values = []

    req.body.procuradores.forEach(proc => procArray.push(proc.cpf_procurador))
    procArray.forEach(v => {
        values.push(('\'' + v + '\'').toString())
    })
    values = values.toString().replace(/'\['/g, '').replace(/'\]'/g, '')

    pool.query(`
        SELECT (procurador_id, cpf_procurador) FROM public.procurador
        WHERE procurador.cpf_procurador in (${values})        
    `, (err, table) => {
        if (err) console.log('EEeeerrrrr', err)
        if (table.hasOwnProperty('rows')) {
            console.log(table.rows)
            res.send(table.rows)
        }
    })
}

module.exports = { cadProcuradores }