const { pool } = require('./config/pgConfig')
const { parseRequestBody } = require('./parseRequest')

const cadSocios = (req, res, next) => {

    const socios = parseRequestBody(req.body.socios)
    let promisseArray = []

    socios.forEach(s => {
        const { keys, values } = s
        let sp = new Promise((resolve, reject) => {
            console.log(`INSERT INTO public.socios (${keys}) VALUES (${values}) RETURNING socio_id`)
            pool.query(`INSERT INTO public.socios (${keys}) VALUES (${values}) RETURNING socio_id`, (err, table) => {
                if (err) console.log(err)
                if (table.hasOwnProperty('rows')) {
                    resolve(table.rows)
                } else {
                    console.log('Nenhum procurador cadastrado.')
                }
            })
        })
        promisseArray.push(sp)
        sp = ''
    })

    if (req.body.procuradores) next()
    else {
        Promise.all(promisseArray)
            .then(()=> res.send(req.delegatario_id.toString()))
    }


}

module.exports = { cadSocios }