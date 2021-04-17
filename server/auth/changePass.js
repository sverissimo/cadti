/**
 * @param {req} objeto com uma única props: req.recoveryMail
 */
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const { changePassMsg } = require('../config/changePassMsg');

const generatePass = (req, res, next) => {

    let password = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 12; i++)
        password += possible.charAt(Math.floor(Math.random() * possible.length));

    const salt = bcrypt.genSaltSync()
    const passwordHash = bcrypt.hashSync(password, salt)

    req.body = { ...req.body, password, passwordHash }
    next()
}

const changePass = async (req, res, next) => {
    const { recoveryMail, passwordHash } = req.body

    // Add a if (user not found)=>send message here to the frontEnd. Maybe try/catch

    await User.findOneAndUpdate(
        { 'email': recoveryMail },
        { $set: { password: passwordHash } },
        { new: true },
        ((err, user) => {
            if (err) console.log('err')
            req.body.user = user
        }))

    next()
}

const sendPass = (req, res, next) => {
    if (!req.body.user) res.send('E-mail não cadastrado.')
    else {
        const { user, password } = req.body,
            { name, surName, email } = user,
            to = email,
            subject = 'Alteração de senha',
            person = name + ' ' + surName,
            html = changePassMsg(person, password)

        req.body = { ...req.body, to, subject, html }
        next()
    }

}

module.exports = { generatePass, changePass, sendPass }