//@ts-check
const { Router } = require("express")
const { requireSeinfra } = require("../auth/checkPermissions")
const { EmpresaController } = require("../controllers/EmpresaController")

const empresaController = new EmpresaController()

/** @param {Router} router  */
const empresaRoutes = router => {
    router
        .route('/empresas/:id?')
        .get(empresaController.list)
        .post(requireSeinfra, empresaController.saveEmpresaAndSocios)
        .patch(requireSeinfra, empresaController.update)
}

module.exports = { empresaRoutes }
