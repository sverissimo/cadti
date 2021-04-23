const
    UserModel = require("../mongo/models/userModel")
    , sendMail = require("../mail/sendMail")
    , newUserTemplate = require("../mail/templates/newUserTemplate")


/**
 * Cria novo usuário. A senha é gerada no router, ao se passar o middleware generatePass
 * @param {object} req 
 * @param {string} res 
 * 
 */
const addUser = async (req, res) => {
    const
        io = req.app.get('io'),
        user = req.body,
        { cpf, name, email, password, passwordHash } = user,
        query = [{ email }, { cpf }],
        subject = 'CadTI - usuário cadastrado com sucesso.',
        alreadyExists = await UserModel.findOne({ $or: query }).select('-password, -__v').lean()

    if (alreadyExists)
        return res.status(422).send('Usuário já cadastrado no CadTI.')

    //Define password provisóra           
    user.password = passwordHash
    const newUser = new UserModel(user)
    console.log("🚀 ~ file: addUser.js ~ line 28 ~ addUser ~ hashedPassword", passwordHash)

    //Salva usuário no MongoDB
    newUser.save((err, doc) => {
        if (err)
            console.log(err)
        const update = { insertedObjects: [doc], collection: 'users' }
        io.sockets.emit('insertElements', update)

        //Envia e-mail com senha provisóra para o usuário
        const message = newUserTemplate(email, password)
        sendMail({ to: email, subject, vocativo: name, message })
        res.status(200).send('saved.')
    })
}

module.exports = addUser