//@ts-check
const { Router } = require("express")
const { requireSeinfra } = require("../auth/checkPermissions")
const { SeguroController } = require("../controllers/SeguroController")
const { SeguroService } = require("../services/SeguroService")

const seguroController = new SeguroController()

/** @param {Router} router  */
const seguroRoutes = router => {

    router.route('/seguros/:id?')
        .get(seguroController.list)
        .post(requireSeinfra, seguroController.save)
        .put(requireSeinfra, seguroController.updateInsurance)

    router.post('/cadSeguroMongo', requireSeinfra, SeguroService.saveUpComingInsurances)
}

module.exports = { seguroRoutes }
