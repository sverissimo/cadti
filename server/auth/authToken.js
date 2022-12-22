const jwt = require('jsonwebtoken')
const { setUserPermissions } = require('./setUserPermissions')

const authToken = (req, res, next) => {
    if (req.headers.authorization === process.env.FILE_SECRET) {
        console.log('Alright, you may pass...')
        req.user = { role: 'admin' }
        setUserPermissions(req, res, req.user)
        return next()
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
        console.log("🚀 ~ file: authToken.js:35 ~ jwt.verify ~ req.user", req.user)

        setUserPermissions(req, res, user)
        next()
    })
}

module.exports = authToken
