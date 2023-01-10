//@ts-check
const { Router } = require("express")
const AltContratoController = require("../controllers/AltContratoController")

const altContratoController = new AltContratoController()

/** @param {Router} router  */
const altContratoRoutes = router => {
    router
        .route('/altContrato/:id?')
        .get(altContratoController.list)
        .post(altContratoController.create)
}

module.exports = { altContratoRoutes }
