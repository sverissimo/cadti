//@ts-check
const UserAlert = require("./UserAlert")

/**
 * Rota para gerar o alerta de usuário
 * Node express params
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const index = async (req, res, next) => {
    const
        alertObject = req.body
        , { type } = req.params
        , userAlert = new UserAlert(alertObject)

    console.log("🚀 ~ file: index.js ~ line 12 ~ index ~ req", req.params)
    try {
        if (type === 'mail') {
            await userAlert.sendMessage()
            res.status(200).send('Message was sent...')
        }
    } catch (err) {
        next(err)
    }

}

module.exports = index
