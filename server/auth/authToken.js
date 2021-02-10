const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {
    //Uncomment those to syncDbs
    /*
    console.dir(req.headers)
    req.user = {}
    req.user.role = 'admin'
    return next() 
    if (req.url.match('/sync') || req.url.match('/api')) return next()
    if (req.connection.remoteAddress.match('::1')) return next()
    */

    const tokens = req.headers.cookie.split(';')

    let token = tokens.find(el => el.match('aToken'))

    if (!token)
        return res.status(401).send('No cadTI token provided...')
    else
        token = token.replace('aToken=', '').trim()

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
        if (err)
            return res.status(403).send(err)

        const { user } = result
        //Armazena o user no express e o filtro de requisições ao mongoDB
        if (user) {
            const empresas = user.empresas && user.empresas
            let filter = {}
            if (user.role !== 'admin')
                filter = {
                    $or: [
                        { 'empresaId': { $in: empresas } },
                        { 'codigoEmpresa': { $in: empresas } }
                    ]
                }
            req.user = user
            req.filter = filter
        }
        next()
    })
}

module.exports = authToken