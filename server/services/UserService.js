//@ts-check
const bcrypt = require('bcrypt');
const { AuthService } = require('../auth/AuthService');
const UserModel = require("../mongo/models/userModel");
const ProcuradorRepository = require('../repositories/ProcuradorRepository');
const SocioRepository = require('../repositories/SocioRepository');
const { hasOtherProcuracao, isSocio } = require('./utilServices');

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
        const filterKey = Object.keys(filter)[0]
        const filterValue = typeof Object.values(filter)[0] === 'string' && Object.values(filter)[0]
        if (filterValue && filterValue.match(',')) {
            filter = {
                ...filter,
                [filterKey]: { $in: filterValue.split(',') }
            }
        }

        const updatedUser = await UserModel.find(filter).select('-password -__v').lean()
        return updatedUser
    }

    /**
     * @typedef {Object} User
     * @property {string} name
     * @property {string} email
     * @property {string} cpf
     * @property {string} role
     *
     * @param {User} user     */
    static addUser = async (user) => {
        const { password: tempPassword, passwordHash } = await AuthService.createPasswordAndHash()
        const createResult = await UserModel.create({ ...user, password: passwordHash })
        const { _id: id } = createResult.toObject()
        return { ...user, id, tempPassword }
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
    * Recebe um sócio ou procurador a ser apagado e atualiza as permissões de usuários
    * @param {object} data - props: cpf e table
    */
    static softDeleteUser = async ({ cpf, table }) => {
        const user = await UserService.find({ cpf })
        if (!user) {
            return false
        }

        let empresas = []
        if (table === 'procuradores') {
            const socio = await new SocioRepository().find({ cpf_socio: cpf })
            //@ts-ignore
            if (socio.length) empresas = socio.empresas.map(e => e.codigoEmpresa)
        }

        if (table === 'socios') {
            const procurador = await new ProcuradorRepository().find({ cpf_procurador: cpf })
            //@ts-ignore
            if (procurador.length) empresas = procurador.empresas
        }

        const updateUser = await UserService.editUser({ cpf, empresas })
        return updateUser
    }

    /**
     * @param {object[]} representantes - procuradores ou sócios
     * @param {number} codigoEmpresa
     */
    static addPermissions = async (representantes, codigoEmpresa) => {
        try {
            const cpfs = representantes.map(r => r.cpf_procurador || r.cpf_socio)
            const filter = ({ 'cpf': { $in: cpfs } })
            const users = await UserModel.find(filter)

            const filteredCpfs = users.filter(user => !user.empresas.includes(codigoEmpresa))
                .map(user => user.cpf)

            const updateFilter = ({ 'cpf': { $in: filteredCpfs } })
            const userUpdate = await UserModel.updateMany(updateFilter, { $push: { 'empresas': codigoEmpresa } })
            return userUpdate
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * Verifica se devem ser removidas as permissões de usuário e call this.removePermissions se for o caso
     * @typedef {object} updatePermissionsInput
     * @property {string[]} [cpfSocios] - cpfs dos representantes
     * @property {string[]} [cpfProcuradores] - cpfs dos representantes
     * @property {number} codigoEmpresa     *
     * @param {updatePermissionsInput} updatePermissionsInput
     */
    static removePermissions = async ({ cpfSocios, cpfProcuradores, codigoEmpresa }) => {
        let cpfsToKeep = []
        let cpfsToRemove = []

        if (cpfProcuradores) {
            const alsoSocios = await isSocio(cpfProcuradores)
            const cpfsWithOtherProcuracao = await hasOtherProcuracao({ cpfs: cpfProcuradores, codigoEmpresa })
            cpfsToKeep = alsoSocios.concat(cpfsWithOtherProcuracao)
            cpfsToRemove = cpfProcuradores.filter(cpf => !cpfsToKeep.includes(cpf))
        }
        else if (cpfSocios) {
            cpfsToKeep = await hasOtherProcuracao({ cpfs: cpfSocios, codigoEmpresa })
            cpfsToRemove = cpfSocios.filter(cpf => !cpfsToKeep.includes(cpf))
        }

        const filter = ({ 'cpf': { $in: cpfsToRemove } })
        const userUpdate = await UserModel.updateMany(filter,
            {
                $pull: {
                    'empresas': Number(codigoEmpresa)
                }
            })
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

    static removeOldMessages = async (oldDocumentIds) => {
        const result = await UserModel.updateMany({}, {
            $pull: {
                messagesRead: { $in: oldDocumentIds },
                deletedMessages: { $in: oldDocumentIds }
            }
        })
        return result
    }
}

module.exports = { UserService }
