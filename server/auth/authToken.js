const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {
    //Uncomment those to syncDbs

    if (req.headers.authorization === process.env.FILE_SECRET) {
        console.log('Alright, you may pass...')
        req.user = {}
        req.user.role = 'admin'
        return next()
    }
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
            if (user.role === 'empresa')
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