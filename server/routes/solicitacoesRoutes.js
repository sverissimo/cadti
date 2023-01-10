//@ts-check
const { Router } = require("express")
const { SolicitacoesController } = require("../controllers/SolicitacoesController")
const solicitacoesController = new SolicitacoesController()

/** @param {Router} router  */
const solicitacoesRoutes = router => {

    router.route('/logs/:id?')
        .get(solicitacoesController.list)
        .post(solicitacoesController.create)
        .patch(solicitacoesController.update)
}

module.exports = { solicitacoesRoutes }
