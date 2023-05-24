const CronJob = require('cron').CronJob
const runAlerts = require('../alerts/runAlerts')
const runDbSync = require('../sync/runDbSync')
const updateSystemStatus = require('./updateSystemStatus')
const runMongoQuery = require('../database/runMongoQuery')
const AlertService = require('../alerts/services/AlertService')

function taskManager() {

    //DEVELOPMENT
    //if (process.env.NODE_ENV !== 'production')
    //      return

    //PRODUCTION
    const d = new Date()

    const dbSyncRoutine = new CronJob('1 0 0 * * *', function () {
        console.log(`---- DB_Sync SGTI/CadTI CALLED at ${d} ----`)
        runDbSync()
    }, null, true, 'America/Sao_Paulo')

    const updateStatus = new CronJob('1 2 0 * * *', function () {
        console.log(`---- updateSystemStatus CALLED at ${d} ----`)
        updateSystemStatus()
    }, null, true, 'America/Sao_Paulo');

    const createAlerts = new CronJob('1 3 0 * * *', function () {
        console.log(`---- runAlerts CALLED at ${d} ----`)
        runAlerts()
    }, null, true, 'America/Sao_Paulo');

    const backupMongo = new CronJob('0 0 22 * * *', () => {
        console.log(`---- backupMongoDB CALLED at ${d} ----`)
        runMongoQuery('backup')
    }, null, true, 'America/Sao_Paulo');

    const removeOldAlerts = new CronJob('0 30 0 * * *', () => {
        console.log(`---- removeOldAlerts CALLED at ${d} ----`)
        AlertService.removeOldAlerts()
    }, null, true, 'America/Sao_Paulo');

    dbSyncRoutine.start()
    updateStatus.start()
    createAlerts.start()
    backupMongo.start()
    removeOldAlerts.start()
}

module.exports = taskManager
