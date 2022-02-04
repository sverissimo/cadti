//@ts-check
const VeiculoController = require('../controllers/VeiculoController')


const
    router = require('express').Router()
    , veiculoController = new VeiculoController()

router.route('/:id?')
    .get((req, res) =>
        req.params.id || Object.keys(req.query).length
            ?
            veiculoController.find(req, res)
            :
            veiculoController.list(req, res)
    )
    .post(veiculoController.create)
    .put(veiculoController.update)

module.exports = router
