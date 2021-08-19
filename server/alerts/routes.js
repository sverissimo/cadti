const AlertController = require('./controllers/AlertController')
const AlertRepository = require('./repositories/AlertRepository')

const
    express = require('express')
    , router = express.Router()
    , controller = new AlertController()

router.get('/', async (req, res) => {
    const alerts = await controller.getAlerts(req)
    res.send(alerts)
})

router.post('/', async (req, res) => {
    const { body } = req
    const result = await new AlertRepository().save(body)
    res.send(result)
})

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