const
    bcrypt = require('bcrypt'),
    UserModel = require('../mongo/models/userModel'),
    jwt = require('jsonwebtoken')

//Cria um hash para a password e salva o usuário
const login = async (req, res) => {

    const
        { password, email } = req.body,
        result = await UserModel.find({ email }),
        user = result[0],
        validPass = await bcrypt.compare(password, user.password)

    if (!user || !validPass)
        return res.status(401).send('Usuário ou senha inválidos.')
    if (!user.verified)
        return res.status(403).send('Aguardando aprovação do usuário.')

    const
        accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' }),
        refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET)
    res.json({ accessToken, refreshToken })
}

module.exports = login