//@ts-check
const AlertService = require("../services/AlertService")
const { UserService } = require("../../services/UserService")
const AlertRepository = require("../repositories/AlertRepository")

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

    async save(req, res, next) {
        try {
            const newAlert
                = await new AlertService().saveAlert(req.body)
            const io = req.app.get('io')
            io.sockets.emit('insertElements', { data: [newAlert], collection: 'avisos', })
            res.status(204).end()
        }
        catch (err) {
            next(err)
        }
    }

    changeReadStatus = async (req, res, next) => {
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
    deleteUserAlerts = async (req, res, next) => {
        if (!req.body.deletedMessages)
            return res.status(400).send('Nenhuma mensagem para apagar.')
        await this.changeReadStatus(req, res, next)
    }

    async delete(req, res, next) {
        try {
            const ids = req.params.id.toString().split(',')
            console.log("🚀 ~ file: AlertController.js:53 ~ AlertController ~ delete ~ ids:", ids)
            const response = await new AlertRepository().deleteAlerts(ids)
            return res.send(response)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = AlertController
