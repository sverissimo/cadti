//@ts-check
const
    { request, response } = require("express")
    , { EmpresaDaoImpl } = require("../infrastructure/EmpresaDaoImpl")
    , { Controller } = require("./Controller")

class EmpresaController extends Controller {

    table = 'empresas'
    primaryKey = 'codigo_empresa'

    /**     
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<any>}
     */
    async saveEmpresaAndSocios(req, res) {

        //Se não tiver sócios no body, next()
        if (!req.body.socios) {
            await this.save(req, res)
            return
        }

        try {
            const
                { empresa, socios } = req.body
                , empresaDaoImpl = new EmpresaDaoImpl()
                , { codigo_empresa, socio_ids } = await empresaDaoImpl.saveEmpresaAndSocios({ empresa, socios })

            return res.status(201).send({ codigo_empresa, socio_ids })

        } catch (error) {
            console.log("🚀 ~ file: EmpresaController.js ~ line 30 ~ EmpresaController ~ saveEmpresaAndSocios ~ error", error)
            res.status(500).send(error)
        }
    }
}

module.exports = { EmpresaController }