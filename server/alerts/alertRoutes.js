//@ts-check
const AlertService = require('./services/AlertService')
const express = require('express')
const router = express.Router()
const AlertController = require('./controllers/AlertController')
const AlertRepository = require('./repositories/AlertRepository')
const { requireAdmin } = require('../auth/checkPermissions')
const controller = new AlertController()


router.get('/', controller.getAlerts)
router.post('/', async (req, res) => {
    const { body } = req
    const result = await new AlertRepository().save(body)
    res.send(result)
})

router.post('/userAlerts', requireAdmin, async (req, res) => {
    const alert = new AlertService({})
    await alert.saveUserAlert(req)
    res.send('Novo aviso criado com sucesso.')
})

router.patch('/changeReadStatus', controller.changeReadStatus)
router.patch('/deleteUserMessages/', controller.deleteUserAlerts)

router.delete('/', requireAdmin, (req, res) => {
    const ids = req.body
    new AlertRepository().deleteAlerts(ids)
        .then(r => res.send(r))
})


module.exports = router