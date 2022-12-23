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
const { lookup } = require('../queries')
const { logHandler } = require('../utils/logHandler')
const { Controller } = require('../controllers/Controller')
const removeEmpresa = require('../users/removeEmpresa')
const { requireSeinfra } = require('../auth/checkPermissions')

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
router.use(/\/veiculos|\/\w+Vehicle(\w+)?|\/baixaVeiculo|\/updateInsurances/, veiculoRoutes)

empresaRoutes(router)
procuracaoRoutes(router)
procuradorRoutes(router)
seguroRoutes(router)
socioRoutes(router)

router.get('/lookUpTable/:table', lookup);

const routes = /|modelosChassi|carrocerias|equipamentos|seguradoras|empresasLaudo|laudos|acessibilidade|compartilhados|/
router.get(`/${routes}/:id`, (req, res, next) => {

    const [_, table, id] = req.path.split('/')
    req.params.id = id
    const controller = new Controller(table, 'id')
    controller.list(req, res, next)
})

router.get('/getOne', new Controller().getOne)
router.get('/findMany', new Controller().findMany)
router.get('/checkIfExists', new Controller().checkIfExists)
router.delete('/delete', requireSeinfra, new Controller().delete)
router.post('/api/addElement', new Controller().addElement)
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

module.exports = router
