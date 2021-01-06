const
    express = require('express'),
    router = express.Router(),
    UserModel = require('../mongo/models/userModel'),
    addUser = require('./addUser'),
    checkPermissions = require('../auth/checkPermissions'),
    deleteUser = require('./deleteUser')

//************************Busca todos os usuários no banco de dados MongoDB****************************
router.get('/getUsers', async (req, res) => {
    if (req.user && req.user.role === 'admin') {
        const users = await UserModel.find().select('-password -__v')
        res.send(users)
    }
    else
        res.status(403).send('O usuário não possui acesso para esta parte do CadTI.')
})

//***************************Adicona um novo usuário já verificado *********************************
router.post('/addUser', checkPermissions, addUser)

router.delete('/deleteUser', checkPermissions, deleteUser)

//****************************Edita os dados de um usuário específico**********************************
router.put('/editUser', checkPermissions, async (req, res) => {
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
    res.status(200)
})

module.exports = router