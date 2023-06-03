//@ts-check
const express = require('express')
const router = express.Router()
const UserModel = require('../mongo/models/userModel')
const { AuthController } = require('./AuthController')
const { AuthService } = require('./AuthService')
const { MailService } = require('../mail/MailService')
const mailSenderServices = require('../mail/mailSender')
const ProcuradorRepository = require('../repositories/ProcuradorRepository')
const SocioRepository = require('../repositories/SocioRepository')

const procuradorRepository = new ProcuradorRepository()
const socioRepository = new SocioRepository()

//@ts-ignore
const mailSender = mailSenderServices[process.env.MAIL_SENDER]
const mailService = new MailService(mailSender)
const authService = new AuthService({ UserModel, procuradorRepository, socioRepository })

const authController = new AuthController({ authService, mailService })

router.post('/signUp', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.get('/verifyUser/:id', authController.verifyUser)
router.post('/retrievePassword', authController.retrievePassword)

module.exports = router
