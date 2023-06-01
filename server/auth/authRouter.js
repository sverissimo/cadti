//@ts-check
const express = require('express')
const router = express.Router()
const signUp = require('./signUp')
const login = require('./login')
const logout = require('./logout')
const verifyUser = require('./verifyUser')
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
const authController = new AuthController(authService, testMailSender)

router.post('/signUp', authController.signUp)
router.post('/login', login)
router.get('/logout', logout)
router.get('/verifyUser/:id', verifyUser)
router.post('/forgotPassword', generatePass, changePass, sendPass)

module.exports = router
