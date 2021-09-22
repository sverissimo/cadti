const UserModel = require("../mongo/models/userModel")

//Retorna o usuário atualizado, seja diretamente para o frontEnd, seja para algum ponto do backEnd
const getUser = async (req, res) => {
    const { user } = req
    if (user) {
        const
            filter = { _id: user._id }
            , updatedUser = await UserModel.findOne(filter).select('-password -__v')
        //Se for passado o res como param, retorna para o backEnd, senão retorna o objeto usuário atualizado
        if (res)
            return res.send(updatedUser)
        return updatedUser
    }
    else
        return res.status(401).send(false)
}

module.exports = getUser