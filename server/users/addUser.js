const UserModel = require("../mongo/models/userModel")

const addUser = async (req, res) => {
    const
        io = req.app.get('io'),
        user = req.body,
        { cpf, email } = user,
        query = [{ email }, { cpf }],
        alreadyExists = await UserModel.findOne({ $or: query }).select('-password, -__v').lean()

    if (alreadyExists)
        return res.status(422).send('Usuário já cadastrado no CadTI.')
    user.password = 'senhaProvisoria'
    newUser = new UserModel(user)

    newUser.save((err, doc) => {
        if (err)
            console.log(err)
        const update = { insertedObjects: [doc], collection: 'users' }
        io.sockets.emit('insertElements', update)
        res.status(200).send('saved.')
    })
}

module.exports = addUser