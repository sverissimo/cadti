const
    { pool } = require('./config/pgConfig'),
    { parseRequestBody } = require('./utils/parseRequest'),
    userSockets = require('./auth/userSockets')

const cadSocios = (req, res, next) => {

    console.log("🚀 ~ file: cadSocios.js ~ line 9 ~ cadSocios ~ socios", req.body)
    const socios = parseRequestBody(req.body.socios)
    let promiseArray = []

    socios.forEach(s => {
        const { keys, values } = s
        let sp = new Promise((resolve, reject) => {
            pool.query(`INSERT INTO public.socios (${keys}) VALUES (${values}) RETURNING socio_id`, (err, table) => {
                if (err) console.log(err)
                if (table.hasOwnProperty('rows')) {
                    resolve(table.rows)
                } else {
                    console.log('Nenhum sócio cadastrado.')
                    resolve()
                }
            })
        })
        promiseArray.push(sp)
        sp = ''
    })

    if (promiseArray.length === 0)
        next()
    let condition = '', ids = []

    Promise.all(promiseArray)
        .then(array => {
            if (array && array[0])
                array.forEach(a => {
                    ids.push(a[0].socio_id)
                })
            if (ids && ids[0]) {
                ids.forEach(id => {
                    condition = condition + `socio_id = '${id}' OR `
                })
                condition = condition.slice(0, condition.length - 3)
                condition = 'WHERE ' + condition
                console.log("🚀 ~ file: cadSocios.js ~ line 44 ~ cadSocios ~ condition", condition)
                //Nesse caso, o userSockets responde o com uma array de socio_id
                userSockets({ req, res, table: 'socios', condition, event: 'insertSocios' })
            }
        })
}

module.exports = { cadSocios }