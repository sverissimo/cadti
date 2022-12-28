//@ts-check
const router = require('express').Router()
const alertRoutes = require('../alerts/alertRoutes')
const { empresaRoutes } = require('./empresaRoutes')
const { procuradorRoutes } = require('./procuradorRoutes')
const { procuracaoRoutes } = require('./procuracaoRoutes')
const { seguroRoutes } = require('./seguroRoutes')
const { socioRoutes } = require('./socioRoutes')
const { userRoutes } = require('../users/userRoutes')
const veiculoRoutes = require('./veiculoRoutes')

const AltContrato = require('../domain/altContrato/AltContrato')
const parametros = require('../parametros/parametros')
const Solicitacoes = require('../domain/solicitacoes/Solicitacoes')
const { lookup } = require('../infrastructure/SQLqueries/queries')
const { logHandler } = require('../utils/logHandler')
const { Controller } = require('../controllers/Controller')
const removeEmpresa = require('../users/removeEmpresa')
const { requireSeinfra } = require('../auth/checkPermissions')
const ProcuradorController = require('../controllers/ProcuradorController')
const { SocioController } = require('../controllers/SocioController')

const altContrato = new AltContrato()
const solicitacoes = new Solicitacoes()

router.route('/altContrato')
    .get(altContrato.list)
    .post(altContrato.create)

router.route('/logs')
    .get(solicitacoes.list)
    .post(logHandler, solicitacoes.create)

router.use('/avisos', alertRoutes)
router.use('/users', userRoutes)
router.use('/parametros', parametros)
router.use(/\/veiculos|\/\w+Vehicle(\w+)?|\/baixaVeiculo|\/updateInsurances|\/laudos/, veiculoRoutes)

empresaRoutes(router)
procuracaoRoutes(router)
procuradorRoutes(router)
seguroRoutes(router)
socioRoutes(router)

router.get('/lookUpTable/:table', lookup);

const routes = /|modelosChassi|modeloCarroceria|carrocerias|equipamentos|seguradoras|empresasLaudo|acessibilidade|compartilhados|/
router.get(`/${routes}/:id`, (req, res, next) => {

    const [_, table, id] = req.path.split('/')
    req.params.id = id
    const controller = new Controller(table, 'id')
    controller.list(req, res, next)
})

router.get('/getOne', new Controller().getOne)
router.get('/findMany', new Controller().findMany)
router.get('/checkIfExists', new Controller().checkIfExists)
router.post('/addElement', requireSeinfra, (req, res, next) => {
    const { table } = req.body
    if (table === 'laudos') {
        //return new VeiculoController()
    }
    new Controller().addElement(req, res, next)
})
router.put('/editElements', (req, res, next) => {
    const { table, tablePK: primaryKey, update } = req.body
    const controller = new Controller(table, primaryKey)
    req.body = update
    return controller.update(req, res, next)
})

router.patch('/removeEmpresa', async (req, res) => {
    const { cpfsToRemove, codigoEmpresa } = req.body

    if (cpfsToRemove && cpfsToRemove[0]) {
        await removeEmpresa({ representantes: cpfsToRemove, codigoEmpresa })
    }
    res.send('permission updated.')
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