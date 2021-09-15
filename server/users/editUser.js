const UserModel = require("../mongo/models/userModel")
const bcrypt = require('bcrypt')

const editUser = async (req, res) => {

    const
        role = req.user && req.user.role,
        userCpf = req.user.cpf,
        io = req.app.get('io'),
        user = req.body,
        { id, cpf, password, confirmPassword } = user,
        query = { '_id': id, 'cpf': cpf },
        options = { new: true, select: '-password, -__v' }

    let hashedPassword
    if (password) {
        hashedPassword = await bcrypt.hashSync(password, 10)
        /* const confirmPass = bcrypt.compareSync(confirmPassword, hashedPassword)
        if (!confirmPass)
            return res.status(422).send('Senhas não conferem.') */
        user.password = hashedPassword
    }

    const updatedUser = await UserModel.findOneAndUpdate(query, user, options)

    if (!updatedUser)
        return res.status(404).send('Usuário não encontrado na base do CADTI.')

    //Se não for admin nem se for o próprio usuário atualizando sua conta, responde 403
    if ((role && role !== 'admin' || !role) && updatedUser.cpf !== userCpf)
        return res.status(403).send('O usuário não possui acesso para esta parte do CadTI.')

    const update = { updatedObjects: [updatedUser], collection: 'users', primaryKey: 'id' }
    await io.sockets.emit('updateAny', update)

    res.status(200).send('Dados de usuário atualizados com sucesso!')
}

module.exports = editUser
