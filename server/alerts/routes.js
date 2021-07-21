const AlertController = require('./controllers/AlertController')

const
    express = require('express')
    , router = express.Router()

router.get('/', async (req, res) => {
    const alerts = await new AlertController().getAlerts()
    res.send(alerts)
})

module.exports = router