//@ts-check
const jwt = require('jsonwebtoken')
const { MailService } = require('../mail/MailService')

class AuthController {

    /** @param{object} authService*/
    constructor(authService, mailService) {
        this.authService = authService
        this.mailService = mailService
    }

    signUp = async (req, res) => {
        const { password, confirmPassword, ...user } = req.body

        const userExists = await this.authService.findByCpfOrEmail(user)
        if (userExists) {
            return res.status(422).send('Usuário já cadastrado.')
        }

        const doubleCheckPassword = password === confirmPassword
        if (!doubleCheckPassword) {
            return res.status(422).send('Senhas não conferem.')
        }

        const newUser = await this.authService.signUp(user)
        const message = new MailService(newUser, this.mailService)
            .createMessage('confirmEmailTemplate')
            .sendMessage()
        res.send(message)
    }

    async login(req, res) {
        const { email } = req.body
        const userFound = await this.authService.findUser({ email })

        if (!userFound) return res.status(401).send('Usuário ou senha inválidos.')

        const validPass = await this.authService.confirmPassword(req.body.password, userFound.password)
        if (!validPass) return res.status(401).send('Usuário ou senha inválidos.')

        //@ts-ignore
        const accessToken = jwt.sign({ user: userFound }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60m' })
        res.cookie('aToken', accessToken, { maxAge: 1000 * 60 * 60, httpOnly: true })
        const rToken = process.env.REFRESH_TOKEN_SECRET

        res.status(200).send(rToken)
    }
}

module.exports = { AuthController }
