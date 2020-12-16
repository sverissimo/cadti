const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {
    const tokens = req.headers.cookie.split(';')

    let token = tokens.find(el => el.match('aToken'))
    console.log(token)
    if (!token)
        console.log('Noooooooooooooooo toooooooooookeeeeeeeeeeeeeeennnnnnnnnn!!!!!!!!!!!!!!')
    //return res.sendStatus(401)
    else
        token = token.replace('aToken=', '')
    console.log(token)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) console.log('fkkkkkkkkkkkkkk', err)
        //if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

module.exports = authToken