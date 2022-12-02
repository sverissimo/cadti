//@ts-check
const router = require('express').Router()
    , { Controller } = require('../controllers/Controller')
    , { EmpresaController } = require('../controllers/EmpresaController')
    , ProcuracaoController = require('../controllers/ProcuracaoController')
    , { SeguroController } = require('../controllers/SeguroController')
    , { SocioController } = require('../controllers/SocioController')

    , getRequestFilter = require('../utils/getRequestFilter')
    , AltContrato = require('../domain/altContrato/AltContrato')
    , ProcuradorRepository = require('../domain/ProcuradorRepository')
    , Solicitacoes = require('../domain/solicitacoes/Solicitacoes')
    , { logHandler } = require('../utils/logHandler')
    , { lookup } = require('../queries')
    , veiculoRoutes = require('./veiculoRoutes')

const
    altContrato = new AltContrato()
    , solicitacoes = new Solicitacoes()
    , empresas = new EmpresaController('empresas', 'codigo_empresa')
    , socioController = new SocioController()
    , procuracaoController = new ProcuracaoController()
    , procuradores = new ProcuradorRepository()
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

router.use(/\/veiculos|\/\w+Vehicle(\w+)?|\/baixaVeiculo/, veiculoRoutes)

router
    .route('/seguros')
    .post(seguroController.save)
    .put(seguroController.updateInsurance)

router
    .route('/empresas/:id?')
    .get(empresas.list)
    .post(empresas.saveEmpresaAndSocios)
    .patch(empresas.update)

router
    .route('/socios/:id?')
    .get(socioController.list)
    .post(socioController.saveMany)
    .put(socioController.updateSocios)

router.post('/checkSocios', socioController.checkSocios)

router.get('/procuradores', procuradores.list)

router
    .route('/procuracoes/:id?')
    .get((req, res) => {
        req.params.id || Object.keys(req.query).length
            ? procuracaoController.find(req, res)
            : procuracaoController.list(req, res)
    })
    .post(procuracaoController.save)

router.get('/lookUpTable/:table', lookup);

const routes = 'modelosChassi|carrocerias|equipamentos|seguros|seguradoras|procuracoes|empresasLaudo|laudos|acessibilidade|compartilhados'
router.get(`/${routes}/:id`, (req, res) => {
    console.log("🚀 ~ file: routes.js:70 ~ router.get ~ req", req.params)
    const
        { table } = res.locals //assigned on getRequestFilter.js
        , controller = new Controller(table)

    controller.list(req, res)
})


router.get('/getOne', new Controller().getOne)

router.put('/editElements', (req, res) => {
    const
        { table, tablePK: primaryKey, update } = req.body
        , controller = new Controller(table, primaryKey)
    req.body = update

    return controller.update(req, res)
})

router.delete('/delete', new Controller().delete)



module.exports = router