//@ts-check
const { Router } = require("express")
const { EmpresaController } = require("../controllers/EmpresaController")

const empresaController = new EmpresaController()

/** @param {Router} router  */
const empresaRoutes = router => {
    router
        .route('/empresas/:id?')
        .get(empresaController.list)
        .post(empresaController.saveEmpresaAndSocios)
        .patch(empresaController.update)
}

module.exports = { empresaRoutes }
