//@ts-check
const express = require('express')
const router = express.Router()
const { requireAdmin } = require('../auth/checkPermissions')
const { UserController } = require('../controllers/UserController')
const { MailService } = require('../mail/MailService')
const mailSenderServices = require('../mail/mailSender')

//@ts-ignore
const mailSender = mailSenderServices[process.env.MAIL_SENDER]
const mailService = new MailService(mailSender)
const userController = new UserController({ mailService })

//A rota PUT não possui autenticação padrão porque o próprio usuário pode alterar seus dados.
router.get('/getUser', userController.getUser)
router.route('/')
    .get(requireAdmin, userController.getUsers)
    .post(requireAdmin, userController.addUser)
    .put(userController.editUser)
    .delete(requireAdmin, userController.deleteUser)

router.patch('/softDelete', requireAdmin, userController.softDelete)

module.exports = { userRoutes: router }
