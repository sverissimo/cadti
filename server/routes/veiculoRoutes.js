const VeiculoController = require('../controllers/VeiculoController')

//@ts-check
const
    router = require('express').Router()
    , veiculoController = new VeiculoController()


router.route('/')
    .get(veiculoController.list)
    .post(veiculoController.create)
    .put(veiculoController.update)

module.exports = router