const
    express = require('express')
    , router = express.Router()
    , AlertController = require('./controllers/AlertController')
    , AlertRepository = require('./repositories/AlertRepository')
    , userAlerts = require('./userAlerts/')
    , controller = new AlertController()


router.get('/', async (req, res) => {
    const alerts = await controller.getAlerts(req)
    res.send(alerts)
})

//Testes
router.post('/', async (req, res) => {
    const { body } = req
    const result = await new AlertRepository().save(body)
    res.send(result)
})

//User alerts
router.post('/userAlerts', userAlerts)


router.patch('/changeReadStatus/', async (req, res) => {
    const
        { ids, read } = req.body
        , result = await controller.changeReadStatus(ids, read)
    res.send(result)
})

router.delete('/', (req, res) => {
    console.log("🚀 ~ file: routes.js ~ line 28 ~ router.delete ~ req", { b: req.body, c: req.data })
    const ids = req.body
    new AlertRepository().deleteAlerts(ids)
        .then(r => res.send(r))
})

/* router.delete('/:id', (req, res) => {
    const { ids } = req.body
    new AlertRepository().deleteAlert(ids)
        .then(r => res.send(r))
})
 */

module.exports = router