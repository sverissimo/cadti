//@ts-check
const express = require('express')
const router = express.Router()
const { requireAdmin } = require('../auth/checkPermissions')
const AlertController = require('./controllers/AlertController')
const controller = new AlertController()

router.get('/', controller.getAlerts)
router.post('/', controller.save)
router.patch('/changeReadStatus', controller.changeReadStatus)
router.patch('/deleteUserMessages/', controller.deleteUserAlerts)
router.delete('/:id', requireAdmin, controller.delete)

module.exports = router
