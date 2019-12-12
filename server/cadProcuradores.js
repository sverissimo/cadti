const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadProcuradores = (req, res) => {

    const procuradores = parseRequestBody(req.body.procuradores)
    

    procuradores.forEach(p => {
        const { keys, values } = p
        console.log(`INSERT INTO public.procurador (${keys}) VALUES (${values})`)

        pool.query(`INSERT INTO public.procurador (${keys}) VALUES (${values})`, (err, table) => {
            if (err) console.log(err)
            if (table.hasOwnProperty('rows')) {
                console.log('ok')
            } else {
                console.log('Nenhum procurador cadastrado.')
            }
        })
    })

    res.send('ok')
}

module.exports = { cadProcuradores }