const AlertController = require('./controllers/AlertController')
const AlertRepository = require('./repositories/AlertRepository')

const
    express = require('express')
    , router = express.Router()

router.get('/', async (req, res) => {
    const alerts = await new AlertController().getAlerts(req)
    res.send(alerts)
})

router.post('/', async (req, res) => {
    const { body } = req
    const result = await new AlertRepository().save(body)
    res.send(result)
})

router.patch('/changeReadStatus/', async (req, res) => {
    const
        { id, read } = req.query
        , result = await new AlertController().changeReadStatus(id, read)
    console.log("🚀 ~ file: routes.js ~ line 16 ~ router.get ~ result", { id, result })

    res.send(result)
})

router.delete('/:id', (req, res) => {
    const { id } = req.params
    new AlertRepository().deleteAlert(id)
        .then(r => res.send(r))
})

module.exports = router