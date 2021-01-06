const UserModel = require("../mongo/models/userModel")


const editUser = async (req, res) => {
    const
        io = req.app.get('io'),
        user = req.body,
        id = user && user.id,
        query = { '_id': id },
        options = { new: true, select: '-password, -__v' },

        updatedUser = await UserModel.findOneAndUpdate(query, user, options)

    if (!updatedUser)
        return res.status(404).send('Usuário não encontrado na base do CADTI.')

    const update = { updatedObjects: [updatedUser], collection: 'users', primaryKey: 'id' }
    io.sockets.emit('updateAny', update)
    res.status(200).send('user updated!')
}

module.exports = editUser
