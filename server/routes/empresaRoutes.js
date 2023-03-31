//@ts-check
const { Router } = require("express")
const { requireSeinfra } = require("../auth/checkPermissions")
const { Repository } = require("../repositories/Repository")
const { EmpresaController } = require("../controllers/EmpresaController")

const empresaRepository = new Repository('empresas', 'codigo_empresa')
const empresaController = new EmpresaController('', '', empresaRepository)

/** @param {Router} router  */
const empresaRoutes = router => {
    router
        .route('/empresas/:id?')
        .get(empresaController.list)
        .post(requireSeinfra, empresaController.saveEmpresaAndSocios)
        .patch(requireSeinfra, empresaController.update)
}

module.exports = { empresaRoutes }
