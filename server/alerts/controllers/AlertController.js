//@ts-check
const AlertService = require("../services/AlertService")
const { UserService } = require("../../services/UserService")

class AlertController {

    async getAlerts(req, res, next) {
        try {
            const filter = { _id: req.user._id }
            const user = await UserService.find(filter)
            const alerts = await new AlertService({}).getAllAlerts(user)
            res.send(alerts)
        } catch (error) {
            next(error)
        }
    }

    async changeReadStatus(req, res, next) {
        try {
            //@ts-ignore
            const user = { ...req.user, ...req.body }
            await UserService.editUser(user)
            return res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    /** O aviso/alerta não é apagado, apenas marcado como apagado em user>>messagesDeleted. */
    async deleteUserAlerts(req, res, next) {
        if (!req.body.deletedMessages)
            return res.status(400).send('Nenhuma mensagem para apagar.')
        await this.changeReadStatus(req, res, next)
    }
}

module.exports = AlertController
