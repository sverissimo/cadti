//@ts-check
const { Router } = require("express")
const { SocioController } = require("../controllers/SocioController")

/** @param {Router} router  */
const socioRoutes = router => {
    const socioController = new SocioController()
    router
        .route('/socios/:id?')
        .get(socioController.list)
        .post(socioController.saveMany)
        .put(socioController.updateSocios)
        .delete(socioController.delete)

    router.post('/checkSocios', socioController.checkSocios)
}

module.exports = { socioRoutes }
