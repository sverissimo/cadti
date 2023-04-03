//@ts-check
const UserAlert = require("./UserAlert")
const AlertService = require("../services/AlertService")

/**
 * Rota para gerar o alerta de usuário com opção de envio por email.
 * Essa rota não foi implementada no frontEnd. Avaliar se é necessário.
 * @deprecated
 */
const index = async (req, res, next) => {
    const alertObject = req.body
    const { type } = req.query
    const userAlert = new UserAlert(alertObject)
    const role = req.user && req.user.role

    if (role !== 'admin' && role !== 'tecnico')
        return res.status(403).send('O usuário não possui permissão para acessar essa parte do sistema.')

    try {
        if (type === 'mail') {
            await userAlert.sendMessage()
            res.status(200).send('Message was sent...')
        }
        if (type === 'saveAlert') {
            const newAlert = new AlertService().saveAlert(req.body)
            res.send(newAlert)
        }
        else
            res.json({ type, alertObject })
    } catch (err) {
        next(err)
    }
}

module.exports = index
