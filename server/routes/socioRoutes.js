//@ts-check
const { Router } = require("express")
const { requireSeinfra } = require("../auth/checkPermissions")
const { SocioController } = require("../controllers/SocioController")

/** @param {Router} router  */
const socioRoutes = router => {
    const socioController = new SocioController()
    router
        .route('/socios/:id?')
        .get(socioController.list)
        .post(requireSeinfra, socioController.saveMany)
        .put(socioController.updateSocios)
        .delete(requireSeinfra, socioController.delete)

    router.post('/checkSocios', socioController.checkSocios)
}

module.exports = { socioRoutes }
