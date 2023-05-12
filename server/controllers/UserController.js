//@ts-check
const { UserService } = require("../services/UserService");

class UserController {

    getUsers = async (req, res, next) => {
        try {
            if (req.params.id || Object.keys(req.query).length) {
                const filter = req.params.id || req.query
                const user = await UserService.find(filter)
                return res.send(user)
            }

            const users = await UserService.list()
            return res.send(users)
        }
        catch (error) {
            next(error)
        }
    }

    //Retorna o usuário atualizado, seja diretamente para o frontEnd, seja para algum ponto do backEnd
    getUser = async (req, res, next) => {
        const { user } = req
        try {
            const filter = { _id: user._id }
            const updatedUser = await UserService.find(filter)
            res.send(updatedUser[0])
        } catch (error) {
            next(error)
        }
    }

    addUser = async (req, res, next) => {
        const io = req.app.get('io')
        const user = req.body
        const { cpf, email } = user
        const query = [{ email }, { cpf }]
        const alreadyExists = await UserService.find({ $or: query })

        if (alreadyExists && alreadyExists.length) {
            return res.status(422).send('Usuário já cadastrado no CadTI.')
        }

        try {
            const savedUser = await UserService.addUser(user)
            const update = { data: [savedUser], collection: 'users' }

            io.sockets.to('admin').to('tecnico').emit('insertElements', update)
            res.status(201).send('saved.')
        } catch (error) {
            next(error)
        }
    }

    editUser = async (req, res, next) => {
        const { user } = req
        const role = user && user.role
        const userUpdate = req.body

        //Se não for admin nem se for o próprio usuário atualizando sua conta, responde 403
        if ((role && role !== 'admin' || !role) && user.cpf !== userUpdate.cpf) {
            return res.status(403).send('O usuário não possui acesso para esta parte do CadTI.')
        }
        try {
            const updatedUser = await UserService.editUser(userUpdate)
            if (!updatedUser) {
                return res.status(404).send('Usuário não encontrado na base do CADTI.')
            }

            const io = req.app.get('io')
            const update = { data: [updatedUser], collection: 'users', primaryKey: 'id' }
            await io.sockets.to('admin').to('tecnico').emit('updateAny', update)
            res.status(200).send('Dados de usuário atualizados com sucesso!')
        } catch (error) {
            next(error)
        }
    }

    deleteUser = async (req, res, next) => {
        const io = req.app.get('io')
        const id = req.query && req.query.id
        try {
            await UserService.deleteUser(id)
            const update = { id, tablePK: 'id', collection: 'users' }
            io.sockets.to('admin').to('tecnico').emit('deleteOne', update)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    softDelete = async (req, res, next) => {
        const { cpf, table } = req.body
        try {
            const updatedUser = await UserService.softDeleteUser({ cpf, table })
            if (!updatedUser) {
                return res.status(404).send('Usuário não encontrado na base do CADTI.')
            }

            const io = req.app.get('io')
            const update = { data: [updatedUser], collection: 'users', primaryKey: 'id' }
            await io.sockets
                .to('admin')
                .to('tecnico')
                .emit('updateAny', update)
            res.status(200).send('Dados de usuário atualizados com sucesso!')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = { UserController }
