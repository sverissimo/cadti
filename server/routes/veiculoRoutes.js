const { VeiculoService } = require('../services/VeiculoService')

//@ts-check
const
    router = require('express').Router()
    , VeiculoController = require('../controllers/VeiculoController')
    , veiculoController = new VeiculoController('veiculos', 'veiculo_id')


router.route('/:id?')
    .get(
        (req, res, next) => {
            const targetPath = req.baseUrl.replace('/api', '')

            switch (targetPath) {
                case '/veiculos':
                    return veiculoController.list(req, res, next)
                case '/allVehicles':
                    return veiculoController.getAllVehicles(req, res) //Busca os veículos de uma empresa incluindo todos os de outras empresas que lhe são compartilhados ou que estão em sua apolice apesar d n ser compartilhado        
                case '/getOldVehicles':
                    return veiculoController.getOldVehicles(req, res)
                case '/checkVehicleExistence':
                    return veiculoController.checkVehicleExistence(req, res)
                default:
                    return res.send('Route not found.')
            }
        }
    )
    .post(veiculoController.create)
    .put(veiculoController.update)
    .patch((req, res) => {
        const targetPath = req.baseUrl.replace('/api', '')

        switch (targetPath) {
            case '/reactivateVehicle':
                return veiculoController.reactivateVehicle(req, res);
            case '/baixaVeiculo':
                return veiculoController.baixaVeiculo(req, res);
            default:
                return res.send('Patch route not found.');
        }
    })

router.put('/api/updateInsurances', VeiculoService.updateInsurance) //REFACTOR


module.exports = router
