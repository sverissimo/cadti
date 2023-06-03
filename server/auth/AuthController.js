//@ts-check
const jwt = require('jsonwebtoken')
const { MailService } = require('../mail/MailService')

class AuthController {

    constructor({ authService, mailService }) {
        this.authService = authService
        this.mailService = mailService
    }

    signUp = async (req, res, next) => {
        try {
            const user = req.body
            const { password, confirmPassword } = user
            const userExists = await this.authService.findByCpfOrEmail(user)
            if (userExists) {
                return res.status(422).send('Usuário já cadastrado.')
            }

            const doubleCheckPassword = password === confirmPassword
            if (!doubleCheckPassword) {
                return res.status(422).send('Senhas não conferem.')
            }

            const newUser = await this.authService.signUp({ ...user, role: 'empresa' })
            const message = new MailService(newUser, this.mailService)
                .createMessage('confirmEmailTemplate')
                .sendMessage()
            res.send(message)
        } catch (error) {
            next(error)
        }
    }

    login = async (req, res, next) => {
        const { email, password } = req.body
        try {
            const userFound = await this.authService.findByCpfOrEmail({ email })
            if (!userFound) {
                return res.status(401).send('Usuário ou senha inválidos.')
            }

            const validPass = this.authService.checkPassword(password, userFound.password)
            console.log("🚀 ~ file: AuthController.js:45 ~ AuthController ~ login= ~ password, userFound.password:", validPass)

            delete userFound.password

            if (!validPass) {
                return res.status(401).send('Usuário ou senha inválidos.')
            }
            if (!userFound.verified) {
                return res.status(403).send('Aguardando aprovação do usuário.')
            }
            if (userFound.role === 'empresa' && !userFound.empresas.length) {
                return res.status(403).send('O usuário não possui vinculação com nenhuma empresa do sistema.')
            }

            //@ts-ignore
            const accessToken = jwt.sign({ user: userFound }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60m' })
            res.cookie('aToken', accessToken, { maxAge: 1000 * 60 * 60, httpOnly: true })
            const rToken = process.env.REFRESH_TOKEN_SECRET
            res.status(200).send(rToken)
        } catch (error) {
            next(error)
        }
    }

    logout = async (_, res, next) => {
        try {
            res.clearCookie('aToken')
            res.sendStatus(204)
        } catch (error) {
            next(error)
        }
    }

    verifyUser = async (req, res, next) => {
        try {
            const { id } = req.params
            const verified = await this.authService.verifyUser(id)

            if (!verified) {
                return res.status(404).send('Usuário não encontrado.')
            }

            return res.sendFile(__dirname + '/verifiedUser.html')
        } catch (error) {
            next(error)
        }
    }

    retrievePassword = async (req, res, next) => {
        try {
            const { email } = req.body
            const user = await this.authService.retrievePassword(email)
            const message = new MailService(user, this.mailService)
                .createMessage('changePassTemplate')
                .sendMessage()

            res.send(message)
            //res.send('New password sent to registered email.')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = { AuthController }
