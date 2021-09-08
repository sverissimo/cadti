//@ts-check
const
    UserAlert = require("./UserAlert")
    , AlertRepository = require("../repositories/AlertRepository")


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
        , { type } = req.query
        , userAlert = new UserAlert(alertObject)

    console.log("🚀 ~ file: index.js ~ line 14 ~ index ~ alertObject", { type, alertObject })

    try {
        if (type === 'mail') {
            await userAlert.sendMessage()
            res.status(200).send('Message was sent...')
        }
        if (type === 'saveAlert') {
            const newAlert = new AlertRepository().save({ ...userAlert, codigo_empresa: 9060 })
            res.send(newAlert)
        }
        else
            res.json({ type, alertObject })
    } catch (err) {
        next(err)
    }

}

module.exports = index
