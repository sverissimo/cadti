//@ts-check
const { request, response } = require("express")
const { Controller } = require("./Controller")
const { Repository } = require("../repositories/Repository")
const { CustomSocket } = require("../sockets/CustomSocket")
const { EmpresaService } = require("../services/EmpresaService")

class EmpresaController extends Controller {

    table = 'empresas'
    primaryKey = 'codigo_empresa'

    constructor(table, primaryKey, repository) {
        super()
        this.table = this.table || table
        this.primaryKey = this.primaryKey || primaryKey
        this.repository = repository || new Repository(this.table, this.primaryKey)
    }

    /**
     * @param {request} req
     * @param {response} res
     * @returns {Promise<any>}
     */
    saveEmpresaAndSocios = async (req, res) => {
        if (!req.body.socios) {
            req.body = req.body.empresa
            await this.save(req, res)
            return
        }

        try {
            const { empresa, socios } = req.body
            const { codigo_empresa, socio_ids } = await EmpresaService.saveEmpresaAndSocios({ empresa, socios })
            const updatedEmpresa = await this.repository.find(codigo_empresa)

            const io = req.app.get('io')
            const empresaSocket = new CustomSocket(io, 'empresas')
            empresaSocket.emit('insertElements', updatedEmpresa, codigo_empresa)

            const socioRepository = new Repository('socios', 'socio_id')
            const updatedSocios = await socioRepository.find(socio_ids)
            const socioSockets = new CustomSocket(io, 'socios')

            socioSockets.emit('insertElements', updatedSocios, codigo_empresa)
            return res.status(201).send({ codigo_empresa, socio_ids })

        } catch (error) {
            console.log("🚀 ~ file: EmpresaController.js ~ line 30 ~ EmpresaController ~ saveEmpresaAndSocios ~ error", error)
            res.status(500).send(error)
        }
    }
}

module.exports = { EmpresaController }
