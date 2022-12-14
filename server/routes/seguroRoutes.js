//@ts-check
const { Router } = require("express")
const { SeguroController } = require("../controllers/SeguroController")
const { SeguroService } = require("../services/SeguroService")

const seguroController = new SeguroController()

/** @param {Router} router  */
const seguroRoutes = router => {

    router.route('/seguros/:id?')
        .get(seguroController.list)
        .post(seguroController.save)
        .put(seguroController.updateInsurance)

    router.post('/cadSeguroMongo', SeguroService.saveUpComingInsurances)
}

module.exports = { seguroRoutes }
