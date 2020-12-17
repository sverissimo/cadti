const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {
    const tokens = req.headers.cookie.split(';')

    let token = tokens.find(el => el.match('aToken'))

    if (!token)
        return res.status(401).send('No cadTI token provided...')
    else
        token = token.replace('aToken=', '').trim()

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send(err)
        if (user && user.user)
            req.user = user.user
        next()
    })
}

module.exports = authToken