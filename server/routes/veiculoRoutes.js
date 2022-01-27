const VeiculoController = require('../controllers/VeiculoController')

//@ts-check
const
    router = require('express').Router()
    , veiculoController = new VeiculoController()

router.route('/:id?')
    .get((req, res) => req.params.id ?
        veiculoController.findOne(req, res) :
        veiculoController.list(req, res)
    )
    .post(veiculoController.create)
    .put(veiculoController.update)




module.exports = router