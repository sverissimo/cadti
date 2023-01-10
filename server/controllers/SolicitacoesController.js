//@ts-check
const logsModel = require("../mongo/models/logsModel")
const { CustomSocket } = require("../sockets/CustomSocket")

class SolicitacoesController {

    list = async (req, res, next) => {
        const { filter } = req
        logsModel.find(filter)
            .then(doc => res.send(doc))
            .catch(err => console.log(err))
    }

    create = async (req, res, next) => {
        const { log } = req.body
        const { id, codigoEmpresa } = log
        if (id) {
            return this.update(req, res, next)
        }

        try {
            const logObject = new logsModel(log)
            const savedLog = await logObject.save()
            const { _id } = savedLog
            const io = req.app.get('io')
            const socket = new CustomSocket(io, 'logs', 'id')

            socket.emit('insertElements', [savedLog], codigoEmpresa)
            return res.status(201).send(_id)
        } catch (error) {
            next(error)
        }
    }

    update = async (req, res, next) => {
        const { log } = req.body
        const { id, codigoEmpresa, subject, history, status, completed } = log

        let updatedObject = { status, subject, completed: completed || false }
        if (!subject) {
            delete updatedObject.subject
        }

        try {
            const doc = await logsModel.findOneAndUpdate(
                { '_id': id },
                {
                    $push: { 'history': history },
                    $set: { ...updatedObject }
                },
                { new: true }
            )

            const io = req.app.get('io')
            const socket = new CustomSocket(io, 'logs', 'id')
            socket.emit('updateAny', [doc], codigoEmpresa)
            return res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = { SolicitacoesController }
