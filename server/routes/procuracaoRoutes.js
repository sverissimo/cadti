//@ts-check
const { Router } = require("express")
const ProcuracaoController = require("../controllers/ProcuracaoController")

const procuracaoController = new ProcuracaoController()

/** @param {Router} router  */
const procuracaoRoutes = router => {
    router
        .route('/procuracoes/:id?')
        .get((req, res, next) => {
            req.params.id || Object.keys(req.query).length
                ? procuracaoController.find(req, res, next)
                : procuracaoController.list(req, res, next)
        })
        .post(procuracaoController.save)
}

module.exports = { procuracaoRoutes }
