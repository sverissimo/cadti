const
    CronJob = require('cron').CronJob
    , runAlerts = require('../alerts/runAlerts')
    , runDbSync = require('../sync/runDbSync')
    , updateSystemStatus = require('./updateSystemStatus')

function taskManager() {

    //DEVELOPMENT
    if (process.env.NODE_ENV !== 'production')
        return

    //PRODUCTION
    const dbSyncRoutine = new CronJob('1 0 0 * * *', function () {
        runDbSync()
    }, null, true, 'America/Sao_Paulo')

    const updateStatus = new CronJob('1 2 0 * * *', function () {
        updateSystemStatus()
    }, null, true, 'America/Sao_Paulo');

    const createAlerts = new CronJob('1 3 0 * * *', function () {
        runAlerts()
    }, null, true, 'America/Sao_Paulo');


    dbSyncRoutine.start()
    updateStatus.start()
    createAlerts.start()

    void 0
}

module.exports = taskManager