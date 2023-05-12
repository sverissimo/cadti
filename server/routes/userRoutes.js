//@ts-check
const express = require('express')
const router = express.Router()
const { requireAdmin } = require('../auth/checkPermissions')
const { UserController } = require('../controllers/UserController')
const { generatePass } = require('../auth/changePass')
const userController = new UserController()

router.get('/getUser', userController.getUser)
router.route('/')
    .get(requireAdmin, userController.getUsers)
    .post(requireAdmin, generatePass, userController.addUser)
    .put(userController.editUser)
    .delete(requireAdmin, userController.deleteUser)

router.patch('/softDelete', requireAdmin, userController.softDelete)
//A rota PUT não possui autenticação padrão porque o próprio usuário pode alterar seus dados.

module.exports = { userRoutes: router }
