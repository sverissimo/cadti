const { SeguroController } = require('../controllers/SeguroController')

//@ts-check
const router = require('express').Router()
    , { Controller } = require('../controllers/Controller')
    , { EmpresaController } = require('../controllers/EmpresaController')
    , ProcuracaoController = require('../controllers/ProcuracaoController')

    , getRequestFilter = require('../utils/getRequestFilter')
    , AltContrato = require('../domain/altContrato/AltContrato')
    , ProcuradorRepository = require('../domain/ProcuradorRepository')
    , Solicitacoes = require('../domain/solicitacoes/Solicitacoes')
    , { logHandler } = require('../utils/logHandler')
    , { lookup } = require('../queries')
    , veiculoRoutes = require('./veiculoRoutes')

    , altContrato = new AltContrato()
    , solicitacoes = new Solicitacoes()
    , empresas = new EmpresaController('empresas', 'codigo_empresa')
    , socios = new Controller('socios', 'socio_id')
    , procuradores = new ProcuradorRepository()
    , procuracaoController = new ProcuracaoController()
    , seguroController = new SeguroController('seguros', 'id')

router
    .route('/altContrato')
    .get(altContrato.list)
    .post(altContrato.create)

router
    .route('/logs')
    .get(solicitacoes.list)
    .post(logHandler, solicitacoes.create)

//Middleware qua define a tabela e cria filtros para os SQL queries conforme permissões de usuário
router.use(getRequestFilter)

router.use('/veiculos', veiculoRoutes)

router.put('/seguros', seguroController.updateInsurance)

router
    .route('/empresas/:id?')
    .get(empresas.list)
    .post(empresas.saveEmpresaAndSocios)
    .patch(empresas.update)

router
    .route('/socios/:id?')
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

        , controller = new Controller(table, primaryKey)
    controller.list(req, res)

})

router.put('/editElements', (req, res) => {
    const
        { table, tablePK: primaryKey, update } = req.body
        , controller = new Controller(table, primaryKey)
    req.body = update

    return controller.update(req, res)

})

module.exports = router