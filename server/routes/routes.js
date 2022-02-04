//@ts-check
const
    EntityRepository = require('../domain/EntityRepository')
    , getRequestFilter = require('../domain/getRequestFilter')
    , AltContrato = require('../domain/altContrato/AltContrato')
    , Empresas = require('../domain/Empresas')
    , ProcuradorRepository = require('../domain/ProcuradorRepository')
    , SocioRepository = require('../domain/SociosRepository')
    , Solicitacoes = require('../domain/solicitacoes/Solicitacoes')
    , { logHandler } = require('../logHandler')
    , { lookup } = require('../queries')
    , veiculoRoutes = require('./veiculoRoutes')

const router = require('express').Router()

const
    altContrato = new AltContrato()
    , solicitacoes = new Solicitacoes()
    , empresas = new Empresas()
    , socios = new SocioRepository()
    , procuradores = new ProcuradorRepository()
    , entityRepository = new EntityRepository()

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

router.get('/empresas', empresas.list)
router.get('/socios', socios.list)
router.get('/procuradores', procuradores.list)

router.get('/lookUpTable/:table', lookup);

const routes = 'modelosChassi|carrocerias|equipamentos|seguros|seguradoras|procuracoes|empresasLaudo|laudos|acessibilidade|compartilhados'
router.get(`/${routes}`, entityRepository.list);

module.exports = router