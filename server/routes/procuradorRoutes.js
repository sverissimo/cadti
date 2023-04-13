//@ts-check
const { Router } = require("express")
const { requireSeinfra } = require("../auth/checkPermissions")
const ProcuradorController = require("../controllers/ProcuradorController")

const procuradorController = new ProcuradorController()

/** @param {Router} router  */
const procuradorRoutes = router => {
    router
        .route('/procuradores/:id?')
        .get(procuradorController.list)
        .post(procuradorController.saveMany)
        .put(procuradorController.updateMany)
        .delete(requireSeinfra, procuradorController.delete)

    router.get('/procuradores/findByCpf/:cpfProcurador', procuradorController.findByCpf)
}

module.exports = { procuradorRoutes }
