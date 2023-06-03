//@ts-check
const bcrypt = require('bcrypt')
const UserModel = require('../mongo/models/userModel')

class AuthService {
    constructor({ UserModel, procuradorRepository, socioRepository }) {
        this.userModel = UserModel
        this.procuradorRepository = procuradorRepository
        this.socioRepository = socioRepository
    }

    findByCpfOrEmail = async (user) => {
        const result = await this.userModel
            .findOne({ $or: [{ 'email': user.email }, { 'cpf': user.cpf }] })
            .lean()
            .select('-deletedMessages -messagesRead -__v')
        return result
    }

    async signUp(user) {
        console.log("🚀 ~ file: AuthService.js:21 ~ AuthService ~ signUp ~ user:", user)
        let { password } = user
        if (!password) {
            password = this.generatePassword()
        }

        const procurador = await this.procuradorRepository.find({ cpf_procurador: user.cpf })
        const socio = await this.socioRepository.find({ cpf_socio: user.cpf })
        const empresas = []

        if (procurador && procurador.empresas && Array.isArray(procurador.empresas)) {
            empresas.push(...procurador.empresas)
        }

        if (socio && socio.empresas && Array.isArray(socio.empresas)) {
            try {
                const empresasSocio = JSON.parse(socio.empresas).map(e => e.codigoEmpresa)
                empresas.push(...empresasSocio)
            } catch (error) {
                console.log("🚀 ~ file: AuthService.js:39 ~ AuthService ~ signUp ~ error:", error)
            }
        }

        user.empresas = empresas
        console.log("🚀 ~ file: AuthService.js:45 ~ AuthService ~ signUp ~ password:", password)
        user.password = await this._hashPassword(password)
        const newUser = await UserModel.create(user);
        return newUser
    }

    async _hashPassword(password) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        return hashedPassword
    }

    generatePassword() {
        let password = ""
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (let i = 0; i < 12; i++) {
            password += possible.charAt(Math.floor(Math.random() * (possible.length - 1)))
        }
        return password
    }

    checkPassword = (password, hashedPassword) => {
        return bcrypt.compareSync(password, hashedPassword)
    }

    retrievePassword = async (email) => {
        const password = this.generatePassword()
        const passwordHash = this._hashPassword(password)

        const user = await this.userModel.findOneAndUpdate(
            { 'email': email },
            { $set: { password: passwordHash } },
            { new: true }
        );

        if (!user) {
            throw new Error('E-mail not found.');
        }

        return { ...user, password };
    }

    /**
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    verifyUser = async (id) => {
        const filter = { _id: id }
        const user = await this.userModel.findOneAndUpdate(filter, { verified: true })
        return !!user
    }
}

module.exports = { AuthService }
