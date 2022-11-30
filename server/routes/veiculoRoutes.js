//@ts-check
const
    router = require('express').Router()
    , VeiculoController = require('../controllers/VeiculoController')
    , veiculoController = new VeiculoController('veiculos', 'veiculo_id')


router.route('/:id?')
    .get(
        (req, res) =>
            req.baseUrl.match('veiculos') ?
                veiculoController.list(req, res)
                : veiculoController.getAllVehicles(req, res) //Busca os veículos de uma empresa incluindo todos os de outras empresas que lhe são compartilhados ou que estão em sua apolice apesar d n ser compartilhado        
    )
    .post(veiculoController.create)
    .put(veiculoController.update)





module.exports = router
