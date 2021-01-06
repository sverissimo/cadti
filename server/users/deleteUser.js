const UserModel = require("../mongo/models/userModel")

const deleteUser = (req, res) => {
    const
        io = req.app.get('io'),
        id = req.query && req.query.id,
        query = { '_id': id }

    UserModel.deleteOne(query, (err, doc) => {
        if (err)
            console.log(err)

        console.log("🚀 ~ file: deleteUser.js ~ line 14 ~ UserModel.deleteOne ~ doc", query)
        const update = { id, tablePK: 'id', collection: 'users' }
        io.sockets.emit('deleteOne', update)
        res.send('deleted.')
    })
}

module.exports = deleteUser
