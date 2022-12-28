//@ts-check
const router = require('express').Router()
const VeiculoController = require('../controllers/VeiculoController')
const veiculoController = new VeiculoController()

router.route('/:id?')
    .get((req, res, next) => {
        const targetPath = req.baseUrl.replace('/api', '')

        switch (targetPath) {
            case '/veiculos':
                return veiculoController.list(req, res, next)
            case '/allVehicles':
                return veiculoController.getAllVehicles(req, res, next) //Busca os veículos de uma empresa incluindo todos os de outras empresas que lhe são compartilhados ou que estão em sua apolice apesar d n ser compartilhado
            case '/getOldVehicles':
                return veiculoController.getOldVehicles(req, res, next)
            case '/checkVehicleExistence':
                return veiculoController.checkVehicleExistence(req, res, next)
            case '/oldVehiclesXls':
                return veiculoController.getOldVehiclesXls(req, res, next)
            default:
                return res.send('Vehicle route not found.')
        }
    })

    .post((req, res, next) => {
        const targetPath = req.baseUrl.replace('/api', '')
        if (targetPath === '/laudos') {
            return veiculoController.addLaudo(req, res, next)
        }

        return veiculoController.create(req, res, next)
    })

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

module.exports = router
