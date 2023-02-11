//@ts-check
const router = require('express').Router()
const alertRoutes = require('../alerts/alertRoutes')
const { altContratoRoutes } = require('./altContratoRoutes')
const { empresaRoutes } = require('./empresaRoutes')
const { procuradorRoutes } = require('./procuradorRoutes')
const { procuracaoRoutes } = require('./procuracaoRoutes')
const { seguroRoutes } = require('./seguroRoutes')
const { socioRoutes } = require('./socioRoutes')
const { userRoutes } = require('./userRoutes')
const veiculoRoutes = require('./veiculoRoutes')

const parametros = require('../parametros/parametros')
const { lookup } = require('../infrastructure/SQLqueries/queries')
const { Controller } = require('../controllers/Controller')
const { requireSeinfra } = require('../auth/checkPermissions')
const ProcuradorController = require('../controllers/ProcuradorController')
const { SocioController } = require('../controllers/SocioController')
const { solicitacoesRoutes } = require('./solicitacoesRoutes')

router.use('/avisos', alertRoutes)
router.use('/users', userRoutes)
router.use('/parametros', parametros)
router.use(/\/veiculos|\/\w+Vehicle(\w+)?|\/baixaVeiculo|\/updateInsurances|\/laudos/, veiculoRoutes)

altContratoRoutes(router)
empresaRoutes(router)
procuracaoRoutes(router)
procuradorRoutes(router)
seguroRoutes(router)
socioRoutes(router)
solicitacoesRoutes(router)

router.get('/lookUpTable/:table', lookup);

const routes = /|modelosChassi|modeloCarroceria|carrocerias|equipamentos|seguradoras|empresasLaudo|acessibilidade|compartilhados|/
router.get(`/${routes}/:id`, (req, res, next) => {
    const [_, table, id] = req.path.split('/')
    req.params.id = id
    const controller = new Controller(table, 'id')
    controller.list(req, res, next)
})

router.get('/checkIfExists', new Controller().checkIfExists)
router.post('/addElement', requireSeinfra, (req, res, next) => {
    const { table } = req.body
    if (table === 'laudos') {
        //return new VeiculoController()
    }
    new Controller().addElement(req, res, next)
})

router.put('/editElements', requireSeinfra, (req, res, next) => {
    const { table, tablePK: primaryKey, update } = req.body
    const controller = new Controller(table, primaryKey)
    req.body = update
    return controller.update(req, res, next)
})

router.delete('/delete', requireSeinfra, (req, res, next) => {
    const { table } = req.query
    if (table === 'procuradores') {
        return new ProcuradorController().delete(req, res, next)
    }
    if (table === 'socios') {
        return new SocioController().delete(req, res, next)
    }

    new Controller().delete(req, res, next)
})

module.exports = router
