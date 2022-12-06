const
    express = require('express'),
    router = express.Router(),
    checkPermissions = require('../auth/checkPermissions'),
    { UserController } = require('../controllers/UserController'),
    { generatePass } = require('../auth/changePass')

const userController = new UserController()

router.get('/getUser', userController.getUser)
router.route('/')
    .get(checkPermissions, userController.getUsers)
    .post(checkPermissions, generatePass, userController.addUser)
    .put(userController.editUser)
    .delete(checkPermissions, userController.deleteUser)
//Essa rota não possui autenticação padrão porque o próprio usuário pode alterar seus dados.

module.exports = { userRoutes: router }