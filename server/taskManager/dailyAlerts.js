/* //@ts-check
const
    { CronJob } = require("cron").CronJob,
    expiringItemsAlert = require('../alerts')


//Development
const dailyAlerts = {
    start: () => {
        expiringItemsAlert('seguros')
        expiringItemsAlert('procuracoes')
    }
}


//dailyAlerts.start()
module.exports = dailyAlerts


 */