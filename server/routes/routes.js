const { Controller } = require('../controllers/Controller')
const { EmpresaController } = require('../controllers/EmpresaController')
const ProcuracaoController = require('../controllers/ProcuracaoController')
const { SocioDaoImpl } = require('../infrastructure/SocioDaoImpl')


//@ts-check
const router = require('express').Router()

    , getRequestFilter = require('../utils/getRequestFilter')
    , AltContrato = require('../domain/altContrato/AltContrato')
    , ProcuradorRepository = require('../domain/ProcuradorRepository')
    , SocioRepository = require('../domain/SociosRepository')
    , Solicitacoes = require('../domain/solicitacoes/Solicitacoes')
    , { Repository } = require('../repositories/Repository')
    , { logHandler } = require('../utils/logHandler')
    , { lookup } = require('../queries')
    , veiculoRoutes = require('./veiculoRoutes')

    , altContrato = new AltContrato()
    , solicitacoes = new Solicitacoes()
    , empresas = new EmpresaController()
    , socios = new Controller('socios', 'socio_id')
    , procuradores = new ProcuradorRepository()
    , procuracaoController = new ProcuracaoController()

router
    .route('/altContrato')
    .get(altContrato.list)
    .post(altContrato.create)

router
    .route('/logs')
    .get(solicitacoes.list)
    .post(logHandler, solicitacoes.create)

router.use(getRequestFilter)

router.use('/veiculos', veiculoRoutes)

router
    .route('/empresas')
    .get(empresas.list)
    .post(empresas.saveEmpresaAndSocios)

router
    .route('/socios')
    .get(socios.list)
    .post(socios.saveMany)

router.get('/procuradores', procuradores.list)
router
    .route('/procuracoes/:id?')
    .get((req, res) => {
        req.params.id || Object.keys(req.query).length
            ?
            procuracaoController.find(req, res)
            :
            procuracaoController.list(req, res)
    })
    .post(procuracaoController.save)

router.get('/lookUpTable/:table', lookup);

const routes = 'modelosChassi|carrocerias|equipamentos|seguros|seguradoras|procuracoes|empresasLaudo|laudos|acessibilidade|compartilhados'
router.get(`/${routes}`, (req, res) => {
    const
        { primaryKey } = req.body
        , { table } = res.locals //assigned on getRequestFilter.js

    controller = new Controller(table, primaryKey)
    controller.list(req, res)

});

module.exports = router