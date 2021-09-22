const UserModel = require("../mongo/models/userModel")

const getUsers = async (req, res) => {
    try {
        const users = await UserModel.find().select('-password -__v')
        console.log("🚀 ~ file: getUsers.js ~ line 6 ~ getUsers ~ users", users)
        res.send(users)
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = getUsers
