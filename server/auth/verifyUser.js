const UserModel = require("../mongo/models/userModel")

const verifyUser = async (req, res) => {
    const
        { id } = req.params
        , filter = { _id: id }
    console.log("🚀 ~ file: verifyUser.js ~ line 9 ~ verifyUser ~ filter ", filter)

    UserModel.findOneAndUpdate(filter, { verified: true }, (err, doc) => {
        if (err)
            console.log(err)
        console.log('***************************', doc)
        res.sendFile(__dirname + '/verifiedUser.html')
    })
}

module.exports = verifyUser
