//@ts-check
const altContratoAlert = require("../alerts/altContratoAlert")
const altContratoModel = require("../mongo/models/altContratoModel")
const { CustomSocket } = require("../sockets/CustomSocket")

class AltContratoController {

    async list(req, res) {
        //@ts-ignore
        const { filter } = req
        altContratoModel.find(filter)
            .then(doc => res.send(doc))
            .catch(err => console.log(err))
    }

    async create(req, res, next) {
        const { razaoSocial, ...body } = req.body
        try {
            const newDoc = new altContratoModel(body)
            const altContrato = await newDoc.save()
            const { _id, codigoEmpresa } = altContrato
            const io = req.app.get('io')
            const socket = new CustomSocket(io, 'altContrato')

            socket.emit('insertElements', [altContrato], codigoEmpresa)
            //altContratoAlert({ ...body, razaoSocial })
            return res.send(_id)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = AltContratoController
