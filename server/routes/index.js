//@ts-check
const { SeguroService } = require('../services/SeguroService')
const ProcuradorController = require('../controllers/ProcuradorController')
const removeEmpresa = require('../users/removeEmpresa')
const parametros = require('../parametros/parametros')
const { userRoutes } = require('../users/userRoutes')
const alertRoutes = require('../alerts/alertRoutes')
const { seguroRoutes } = require('./seguroRoutes')
const { socioRoutes } = require('./socioRoutes')

const router = require('express').Router()
    , { Controller } = require('../controllers/Controller')
    , { EmpresaController } = require('../controllers/EmpresaController')
    , ProcuracaoController = require('../controllers/ProcuracaoController')
    , { SeguroController } = require('../controllers/SeguroController')
    , { SocioController } = require('../controllers/SocioController')

    , getRequestFilter = require('../utils/getRequestFilter')
    , AltContrato = require('../domain/altContrato/AltContrato')
    , Solicitacoes = require('../domain/solicitacoes/Solicitacoes')
    , { logHandler } = require('../utils/logHandler')
    , { lookup } = require('../queries')
    , veiculoRoutes = require('./veiculoRoutes')

const
    altContrato = new AltContrato()
    , solicitacoes = new Solicitacoes()
    , empresas = new EmpresaController('empresas', 'codigo_empresa')
    , socioController = new SocioController()
    , procuradorController = new ProcuradorController()
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

router.use('/avisos', alertRoutes)
router.use('/users', userRoutes)
router.use('/parametros', parametros)

//router.use(/\/w+Upload|\/\w+File(\w+)?/, fileRoutes)
//Middleware qua define a tabela e cria filtros para os SQL queries conforme permissões de usuário
router.use(getRequestFilter)

router.use(/\/veiculos|\/\w+Vehicle(\w+)?|\/baixaVeiculo|\/updateInsurances/, veiculoRoutes)

seguroRoutes(router)
socioRoutes(router)

router
    .route('/empresas/:id?')
    .get(empresas.list)
    .post(empresas.saveEmpresaAndSocios)
    .patch(empresas.update)

/* router
    .route('/socios/:id?')
    .get(socioController.list)
    .post(socioController.saveMany)
    .put(socioController.updateSocios)

router.post('/checkSocios', socioController.checkSocios)
 */
router
    .route('/procuradores')
    .get(procuradorController.list)
    .post(procuradorController.saveMany)
    .put(procuradorController.updateMany)
    .delete(procuradorController.delete)

router
    .route('/procuracoes/:id?')
    .get((req, res, next) => {
        req.params.id || Object.keys(req.query).length
            ? procuracaoController.find(req, res, next)
            : procuracaoController.list(req, res, next)
    })
    .post(procuracaoController.save)

router.get('/lookUpTable/:table', lookup);

const routes = 'modelosChassi|carrocerias|equipamentos|seguros|seguradoras|procuracoes|empresasLaudo|laudos|acessibilidade|compartilhados'
router.get(`/${routes}/:id`, (req, res, next) => {
    console.log("🚀 ~ file: routes.js:70 ~ router.get ~ req", req.params)
    const
        { table } = res.locals //assigned on getRequestFilter.js
        , controller = new Controller(table)

    controller.list(req, res, next)
})


router.get('/getOne', new Controller().getOne)
router.get('/findMany', new Controller().findMany)
router.get('/checkIfExists', new Controller().checkIfExists)
router.post('/api/addElement', new Controller().addElement)
router.put('/editElements', (req, res, next) => {
    const
        { table, tablePK: primaryKey, update } = req.body
        , controller = new Controller(table, primaryKey)
    req.body = update

    return controller.update(req, res, next)
})

router.delete('/delete', new Controller().delete)

router.patch('/removeEmpresa', async (req, res) => {
    const { cpfsToRemove, codigoEmpresa } = req.body

    if (cpfsToRemove && cpfsToRemove[0])
        await removeEmpresa({ representantes: cpfsToRemove, codigoEmpresa })

    res.send('permission updated.')
})

module.exports = router
