//@ts-check
const { request, response } = require("express")
const { Controller } = require("./Controller")
const { SeguroService } = require("../services/SeguroService")
const { CustomSocket } = require("../sockets/CustomSocket")
const { Repository } = require("../repositories/Repository")
const segurosModel = require("../mongo/models/segurosModel")

class SeguroController extends Controller {

    table = 'seguros'
    primaryKey = 'id'
    repository = new Repository(this.table, this.primaryKey)

    /** @override */
    save = async (req, res, next) => {
        const seguro = req.body
        if (!seguro.apolice) {
            return res.status(400).send('O número da apólice é obrigatório.')
        }

        try {
            const { seguroId, updatedVehicles } = await SeguroService.save(seguro)
            const io = req.app.get('io')
            const createdEntity = await this.repository.find(seguroId)
            const { codigo_empresa } = createdEntity[0]

            const seguroSocket = new CustomSocket(io, this.table, this.primaryKey)
            seguroSocket.emit('insertElements', createdEntity, codigo_empresa)

            if (updatedVehicles) {
                const updatedData = await new Repository('veiculos', 'veiculo_id').find(updatedVehicles)
                const veiculoSocket = new CustomSocket(io, 'veiculos', 'veiculo_id')
                veiculoSocket.emit('updateAny', updatedData, codigo_empresa)
            }

            res.status(201).json(seguroId)
        } catch (error) {
            next(error)
        }
    }

    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<any>}
     */
    updateInsurance = async (req, res, next) => {
        const { update, vehicleIds, deletedVehicleIds } = req.body
        try {
            const updated = await SeguroService.updateInsurance({ update, vehicleIds, deletedVehicleIds })
            const { updatedInsurance, updatedVehicles } = updated
            res.status(200).send('Seguro e veículos atualizados.')
            //@ts-ignore
            const codigoEmpresa = updatedInsurance.codigo_empresa || updatedVehicles.codigo_empresa
            const io = req.app.get('io')

            if (updatedInsurance) {
                const seguroSocket = new CustomSocket(io, this.table, this.primaryKey)
                seguroSocket.emit('updateAny', updatedInsurance, codigoEmpresa)
            }

            if (updatedInsurance) {
                const veiculoSocket = new CustomSocket(io, 'veiculos', 'veiculo_id')
                veiculoSocket.emit('updateAny', updatedVehicles, codigoEmpresa)
            }

        } catch (error) {
            next(error)
        }
    }

    /**Salva seguros com data de vigência futura no MongoDB */
    saveUpComingInsurances = async (req, res, next) => {
        const seguro = req.body
        const seguroModel = new segurosModel(seguro)
        await seguroModel.save()
            .catch(error => next(error))

        return res.status(201).end()
    }
}

module.exports = { SeguroController }
