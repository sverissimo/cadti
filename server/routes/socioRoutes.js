//@ts-check
const { Router } = require("express")
const { SocioController } = require("../controllers/SocioController")

/** @param {Router} router  */
const socioRoutes = router => {
    const socioController = new SocioController()
    console.log("🚀 ~ file: socioRoutes.js:8 ~ socioRoutes ~ socioController", socioController)
    router
        .route('/socios/:id?')
        .get(socioController.list)
        .post(socioController.saveMany)
        .put(socioController.updateSocios)

    router.post('/checkSocios', socioController.checkSocios)
}

module.exports = { socioRoutes }
