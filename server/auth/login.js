const
    bcrypt = require('bcrypt'),
    UserModel = require('../mongo/models/userModel')

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

    return res.send({ password, userFound })
}

module.exports = login