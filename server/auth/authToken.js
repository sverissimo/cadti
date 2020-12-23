const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {

    console.log(req.url, req.connection.remoteAddress)

    //Uncomment those to syncDbs
    //return next()
    //if (req.url.match('/sync') || req.url.match('/api')) return next()
    //if (req.connection.remoteAddress.match('::1')) return next()

    const tokens = req.headers.cookie.split(';')
    console.log(req.url)
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