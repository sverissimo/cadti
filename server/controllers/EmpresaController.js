//@ts-check
const
    { request, response } = require("express")
    , { EmpresaDaoImpl } = require("../infrastructure/EmpresaDaoImpl")
    , { Controller } = require("./Controller")
    , { Repository } = require("../repositories/Repository")
    , { CustomSocket } = require("../sockets/CustomSocket")


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

        //Se não tiver sócios no body, next()
        if (!req.body.socios) {
            req.body = req.body.empresa
            console.log("🚀 ~ file: EmpresaController.js ~ line 30 ~ EmpresaController ~ saveEmpresaAndSocios= ~ req.body", req.body)
            await this.save(req, res)
            return
        }

        try {
            const
                { empresa, socios } = req.body
                , empresaDaoImpl = new EmpresaDaoImpl()
                , { codigo_empresa, socio_ids } = await empresaDaoImpl.saveEmpresaAndSocios({ empresa, socios })

                , updatedEmpresa = await this.repository.find(codigo_empresa)
            req.body.codigoEmpresa = codigo_empresa
            const socket = new CustomSocket(req)
            await socket.emit('insertElements', updatedEmpresa)

            const socioRepository = new Repository('socios', 'socio_id')
                , updatedSocios = await socioRepository.find(socio_ids)
                , socioSockets = new CustomSocket(req, 'socios')

            socioSockets.emit('insertElements', updatedSocios)
            return res.status(201).send({ codigo_empresa, socio_ids })

        } catch (error) {
            console.log("🚀 ~ file: EmpresaController.js ~ line 30 ~ EmpresaController ~ saveEmpresaAndSocios ~ error", error)
            res.status(500).send(error)
        }
    }
}

module.exports = { EmpresaController }
