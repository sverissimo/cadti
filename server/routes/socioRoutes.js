//@ts-check
const { Router } = require("express")
const { SocioController } = require("../controllers/SocioController")

const socioController = new SocioController()

/** @param {Router} router  */
const socioRoutes = router => {
    router
        .route('/socios/:id?')
        .get(socioController.list)
        .post(socioController.saveMany)
        .put(socioController.updateSocios)

    router.post('/checkSocios', socioController.checkSocios)
}

module.exports = { socioRoutes }
