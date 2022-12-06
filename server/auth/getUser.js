//@ts-check
const UserModel = require("../mongo/models/userModel")

//Retorna o usuário atualizado, seja diretamente para o frontEnd, seja para algum ponto do backEnd
const getUser = async (req) => {
    const { user } = req
    if (!user) {
        throw new Error('No user provided (getUser)')
    }
    const filter = { _id: user._id }
    const updatedUser = await UserModel.findOne(filter).select('-password -__v')

    return updatedUser
}

module.exports = getUser