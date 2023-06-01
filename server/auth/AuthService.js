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
        const result = await this.userModel.find({ $or: [{ 'email': user.email }, { 'cpf': user.cpf }] })
        if (!result.length) return false
        return result[0]
    }

    async signUp(user) {
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
                console.log("🚀 ~ file: AuthService.js:42 ~ AuthService ~ signUp ~ error:", error)
            }
        }

        user.empresas = empresas
        user.password = await this._hashPassword(password)
        console.log("🚀 ~ file: AuthService.js:44 ~ AuthService ~ signUp ~ user:", user)
        const newUser = await UserModel.create(user);
        return newUser
    }

    async _hashPassword(password) {
        console.log("🚀 ~ file: AuthService.js:48 ~ AuthService ~ _hashPassword ~ password:", password)
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

    async confirmPassword(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword)
    }
}

module.exports = { AuthService }
