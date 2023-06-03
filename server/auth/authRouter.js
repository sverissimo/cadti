//@ts-check
const express = require('express')
const router = express.Router()
const { generatePass, changePass, sendPass } = require('./changePass')
const { AuthController } = require('./AuthController')
const { AuthService } = require('./AuthService')
const UserModel = require('../mongo/models/userModel')
const ProcuradorRepository = require('../repositories/ProcuradorRepository')
const SocioRepository = require('../repositories/SocioRepository')
const testMailSender = require('../mail/testMailSender')

const procuradorRepository = new ProcuradorRepository()
const socioRepository = new SocioRepository()

const authService = new AuthService({ UserModel, procuradorRepository, socioRepository })
const authController = new AuthController({ authService, mailService: testMailSender })

router.post('/signUp', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.get('/verifyUser/:id', authController.verifyUser)
router.post('/retrievePassword', authController.retrievePassword)

module.exports = router
