const
    bcrypt = require('bcrypt'),
    UserModel = require("../mongo/models/userModel"),
    { getUpdatedData } = require("../getUpdatedData")

const addUser = async (req, res) => {
    const
        io = req.app.get('io'),
        user = req.body,
        { cpf, email } = user,
        query = [{ email }, { cpf }],
        alreadyExists = await UserModel.findOne({ $or: query }).select('-password, -__v').lean()

    if (alreadyExists)
        return res.status(422).send('Usuário já cadastrado no CadTI.')

    //Define password provisóra de 1234
    const
        salt = await bcrypt.genSalt(10),
        hashedPassword = await bcrypt.hash('1234', salt)
    user.password = hashedPassword
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