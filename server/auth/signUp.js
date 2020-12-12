const
    bcrypt = require('bcrypt'),
    UserModel = require('../mongo/models/userModel')

//Cria um hash para a password e salva o usuário
const signUp = async (req, res) => {

    const
        { password, confirmPassword, ...user } = req.body,
        result = await UserModel.find({ email: user.email }),
        userExists = result[0]

    //Verifica se o usuário já existe
    if (userExists)
        return res.status(422).send('Usuário já existente.')

    //Cria o hash da password
    const
        salt = await bcrypt.genSalt(10),
        hasedPassword = await bcrypt.hash(password, salt),
        confirmPass = bcrypt.compareSync(confirmPassword, hasedPassword)
    // confere confirmação de senha
    if (!confirmPass)
        return res.status(422).send('Senhas não conferem.')

    //Salva o usuário no DB
    newUser = new UserModel({ ...user, password: hasedPassword }),
        storedUser = await newUser.save()

    res.send(storedUser)
}

module.exports = signUp