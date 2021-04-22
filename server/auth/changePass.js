/**
 * @param {req} objeto com uma única props: req.recoveryMail
 */

const
    bcrypt = require('bcrypt')
    , UserModel = require('../mongo/models/userModel')
    , changePassTemplate = require('../mail/templates/changePassTemplate');
const sendMail = require('../mail/sendMail');


const generatePass = (req, res, next) => {

    let password = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 12; i++)
        password += possible.charAt(Math.floor(Math.random() * (possible.length - 1)));

    const salt = bcrypt.genSaltSync()
    const passwordHash = bcrypt.hashSync(password, salt)

    req.body = { ...req.body, password, passwordHash }
    next()
}

const changePass = async (req, res, next) => {
    const { recoveryMail, passwordHash } = req.body

    // Add a if (user not found)=>send message here to the frontEnd. Maybe try/catch

    await UserModel.findOneAndUpdate(
        { 'email': recoveryMail },
        { $set: { password: passwordHash } },
        { new: true },
        ((err, user) => {
            if (err) console.log('err')
            req.body.user = user
        }))

    next()
}

const sendPass = async (req, res, next) => {
    if (!req.body.user)
        res.status(404).send('E-mail não cadastrado.')
    else {
        const
            { user, password } = req.body,
            { name, email } = user,
            to = email,
            subject = 'Alteração de senha',
            message = changePassTemplate(password)

        await sendMail({ to, subject, vocativo: name, message })
        res.send('Nova senha enviada para o e-mail cadastrado.')
    }
}

module.exports = { generatePass, changePass, sendPass }