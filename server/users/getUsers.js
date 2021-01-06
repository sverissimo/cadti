const UserModel = require("../mongo/models/userModel")

const getUsers = async (req, res) => {
    try {
        const users = await UserModel.find().select('-password -__v')
        res.send(users)
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = getUsers
