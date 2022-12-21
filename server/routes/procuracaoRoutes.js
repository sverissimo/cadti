//@ts-check
const { Router } = require("express")
const ProcuracaoController = require("../controllers/ProcuracaoController")

const procuracaoController = new ProcuracaoController()

/** @param {Router} router  */
const procuracaoRoutes = router => {
    router.route('/procuracoes/:id?')
        .get(procuracaoController.list)
        .post(procuracaoController.save)
        .delete(procuracaoController.delete)
}

module.exports = { procuracaoRoutes }
