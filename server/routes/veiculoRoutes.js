//@ts-check
const VeiculoController = require('../controllers/VeiculoController')


const
    router = require('express').Router()
    , veiculoController = new VeiculoController('veiculos', 'veiculo_id')

router.route('/:id?')
    .get(veiculoController.list)
    .post(veiculoController.create)
    .put(veiculoController.update)

module.exports = router
