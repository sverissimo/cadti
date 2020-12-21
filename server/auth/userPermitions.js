const UserModel = require("../mongo/models/userModel")

const setUserPermitions = async (req, res, next) => {
    const { user } = req
    if (user) {
        const
            query = { _id: user._id },
            usersFound = await UserModel.find(query),
            userFound = usersFound[0]

        if (userFound.empresas) {            
            req.empresas = userFound.empresas
        }
    }
    next()
}

module.exports = setUserPermitions