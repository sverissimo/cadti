const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {
    if (req.headers.authorization === process.env.FILE_SECRET) {
        //console.log('Alright, you may pass...')
        req.user = {
            _id: '5fe2375269d14d13906ffe7a',
            role: 'admin'
        }
        return next()
    }

    if (typeof req.headers.cookie !== 'string') {
        return res.status(403).send('Usuário não logado no CadTI.')
    }
    const tokens = req.headers.cookie.split(';')
    let token = tokens.find(el => el.match('aToken'))

    if (!token) {
        return res.status(401).send('No cadTI token provided...')
    }

    token = token.replace('aToken=', '').trim()
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
        if (err) {
            return next(err)
        }
        const { user } = result
        const { role, empresas } = user

        if (!user || !role) {
            return res.status(403).send('You do not have permission to access this.')
        }

        if (role === 'empresa' && !empresas.length) {
            return res.send([])
        }

        req.user = user
        next()
    })
}

module.exports = authToken
