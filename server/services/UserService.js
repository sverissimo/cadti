//@ts-check
const bcrypt = require('bcrypt');
const sendMail = require("../mail/sendMail")
const newUserTemplate = require("../mail/templates/newUserTemplate")
const UserModel = require("../mongo/models/userModel");

class UserService {
    static list = async () => {
        try {
            const users = await UserModel.find().select('-password -__v')
            return users
        }
        catch (error) {
            throw new Error(error.message)
        }
    }

    static find = async (filter) => {
        if (!filter) {
            throw new Error('UserService - No filter provided for the DB query.')
        }
        const updatedUser = await UserModel.findOne(filter).select('-password -__v').lean()
        return updatedUser
    }

    /**
     * @typedef {Object} User
     * @property {string} name
     * @property {string} email
     * @property {string} password
     * @property {string} passwordHash
     *
     * @param {User} user     */
    static addUser = async (user) => {
        const { name, email, password, passwordHash } = user
        const subject = 'CadTI - usuário cadastrado com sucesso.'

        user.password = passwordHash
        const newUser = new UserModel(user)

        newUser.save((err, savedUser) => {
            if (err) {
                throw new Error(err.message)
            }
            const message = newUserTemplate(email, password)
            //@ts-ignore
            sendMail({ to: email, subject, vocativo: name, message })
            return savedUser
        })
    }

    static editUser = async (user) => {
        const { id, cpf, password } = user
        const query = { $or: [{ '_id': id }, { 'cpf': cpf }] }
        const options = { new: true, select: '-password, -__v' }

        let hashedPassword = ''
        try {
            if (password) {
                hashedPassword = await bcrypt.hashSync(password, 10)
                user.password = hashedPassword
            }
            const updatedUser = await UserModel.findOneAndUpdate(query, user, options)
            return updatedUser
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * @param {object[]} procuradores
     * @param {number} codigoEmpresa
     */
    static addPermissions = async (procuradores, codigoEmpresa) => {
        const cpfs = procuradores.map(p => p.cpf_procurador)
        const filter = ({ 'cpf': { $in: cpfs } })
        const users = await UserModel.find(filter)

        const filteredCpfs = users.filter(user => !user.empresas.includes(codigoEmpresa))
            .map(user => user.cpf)

        const updateFilter = ({ 'cpf': { $in: filteredCpfs } })
        const userUpdate = await UserModel.updateMany(updateFilter, { $push: { 'empresas': codigoEmpresa } })
        return userUpdate
    }

    /**
     * @param {string[]} cpfs
     * @param {number} codigoEmpresa
     */
    static removePermissions = async (cpfs, codigoEmpresa) => {
        const filter = ({ 'cpf': { $in: cpfs } })
        const userUpdate = await UserModel.updateMany(filter, { $pull: { 'empresas': codigoEmpresa } })
        return userUpdate
    }

    static deleteUser = async id => {
        const query = { '_id': id }
        UserModel.deleteOne(query, (err, doc) => {
            if (err) {
                throw new Error(err.message)
            }
            return 'deleted.'
        })
    }
}

module.exports = { UserService }
