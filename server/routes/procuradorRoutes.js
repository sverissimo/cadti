//@ts-check
const { Router } = require("express")
const ProcuradorController = require("../controllers/ProcuradorController")

const procuradorController = new ProcuradorController()

/** @param {Router} router  */
const procuradorRoutes = router => {
    router
        .route('/procuradores/:id?')
        .get(procuradorController.list)
        .post(procuradorController.saveMany)
        .put(procuradorController.updateMany)
        .delete(procuradorController.delete)
}

module.exports = { procuradorRoutes }
