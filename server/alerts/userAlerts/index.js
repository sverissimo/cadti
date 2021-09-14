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
        , role = req.user && req.user.role

    if (role !== 'admin' && role !== 'tecnico')
        return res.status(403).send('O usuário não possui permissão para acessar essa parte do sistema.')

    try {
        if (type === 'mail') {
            await userAlert.sendMessage()
            res.status(200).send('Message was sent...')
        }
        if (type === 'saveAlert') {
            // @ts-ignore
            const newAlert = new AlertRepository().save(userAlert)
            res.send(newAlert)
        }
        else
            res.json({ type, alertObject })
    } catch (err) {
        next(err)
    }

}

module.exports = index
