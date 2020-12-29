const
    bcrypt = require('bcrypt'),
    UserModel = require('../mongo/models/userModel'),
    jwt = require('jsonwebtoken')

//Cria um hash para a password e salva o usuário
const login = async (req, res) => {

    const
        { email } = req.body,
        result = await UserModel.find({ email }).lean(),
        userFound = result[0]

    if (!userFound)
        return res.status(401).send('Usuário ou senha inválidos.')

    const validPass = await bcrypt.compare(req.body.password, userFound.password)
    if (!validPass)
        return res.status(401).send('Usuário ou senha inválidos.')

    if (!userFound.verified)
        return res.status(403).send('Aguardando aprovação do usuário.')

    const
        { password, __v, ...user } = userFound,
        accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' })

    res.cookie('aToken', accessToken, { maxAge: 1000 * 60 * 40, httpOnly: true })
    res.status(200).json({ accessToken })

    //refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET)
    //res.cookie('rToken', refreshToken, { maxAge: 1000 * 60 * 60 * 2, httpOnly: true })
}

module.exports = login