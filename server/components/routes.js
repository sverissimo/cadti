//@ts-check
const
    EntityRepository = require('./EntityRepository')
    , getRequestFilter = require('./getRequestFilter')
    , AltContrato = require('./altContrato/AltContrato')
    , Empresas = require('./Empresas')
    , ProcuradorRepository = require('./ProcuradorRepository')
    , SocioRepository = require('./SociosRepository')
    , Solicitacoes = require('./solicitacoes/Solicitacoes')
    , Veiculos = require('./Veiculos')
    , { logHandler } = require('../logHandler')
    , { lookup } = require('../queries')

const router = require('express').Router()

const
    altContrato = new AltContrato()
    , solicitacoes = new Solicitacoes()
    , veiculos = new Veiculos()
    , empresas = new Empresas()
    , socios = new SocioRepository()
    , procuradores = new ProcuradorRepository()
    , entityRepository = new EntityRepository()

router
    .route('/altContrato')
    .get(altContrato.list)
    .post(altContrato.create)

router.get('/logs', solicitacoes.list)
router.post('/logs', logHandler, solicitacoes.create)

router.use(getRequestFilter)

router.get('/veiculos', veiculos.list)
router.get('/empresas', empresas.list)
router.get('/socios', socios.list)
router.get('/procuradores', procuradores.list)

router.get('/lookUpTable/:table', lookup);

const routes = 'modelosChassi|carrocerias|equipamentos|seguros|seguradoras|procuracoes|empresasLaudo|laudos|acessibilidade|compartilhados|allVehicleFields'
router.get(`/${routes}`, entityRepository.list);

module.exports = { componentRouter: router }