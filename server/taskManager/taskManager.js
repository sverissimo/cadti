const
    CronJob = require('cron').CronJob
    , runAlerts = require('../alerts/runAlerts')
    , runDbSync = require('../sync/runDbSync')
    , updateSytemStatus = require('./updateSystemStatus')

function taskManager() {

    //DEVELOPMENT
    if (process.env.NODE_ENV !== 'production')
        return

    //PRODUCTION
    const dailyTasks = new CronJob('1 0 0 * * *', async function () {

        updateSytemStatus()
        setTimeout(() => { runAlerts() }, 15000); //Ativar alertas automáticos 15 segundos após a atualização de status.

    }, null, true, 'America/Sao_Paulo');


    const dbSyncRoutine = new CronJob('0 44 * * * *', async function () {
        runDbSync()
    })

    dailyTasks.start()
    dbSyncRoutine.start()
    void 0
}

module.exports = taskManager