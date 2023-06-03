//@ts-check
const jwt = require('jsonwebtoken')

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
            await this.mailService
                .setUser(newUser)
                .createMessage('confirmEmailTemplate')
                .sendMessage()

            res.send('User created. An confirmation email has been sent.')
        } catch (error) {
            next(error)
        }
    }

    login = async (req, res, next) => {
        const { email, password: passwordInput } = req.body
        try {
            const userFound = await this.authService.findByCpfOrEmail({ email })
            if (!userFound) {
                return res.status(401).send('Usuário ou senha inválidos.')
            }

            const validPass = this.authService.checkPassword(passwordInput, userFound.password)
            if (!validPass) {
                return res.status(401).send('Usuário ou senha inválidos.')
            }

            if (!userFound.verified) {
                return res.status(403).send('Aguardando confirmação de e-mail.')
            }

            if (userFound.role === 'empresa' && !userFound.empresas.length) {
                return res.status(403).send('O usuário não possui vinculação com nenhuma empresa do sistema.')
            }

            const { password, ...user } = userFound
            //@ts-ignore
            const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60m' })
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
                return res.status(404).sendFile(__dirname + '/userNotFound.html')
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

            if (!user) {
                return res.status(404).send('Usuário não cadastrado.')
            }

            await this.mailService
                .setUser(user)
                .createMessage('retrievePassTemplate')
                .sendMessage()

            res.send('Instruções enviadas para o e-mail cadastrado.')
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message || 'Erro ao tentar recuperar a senha.')
        }
    }
}

module.exports = { AuthController }
