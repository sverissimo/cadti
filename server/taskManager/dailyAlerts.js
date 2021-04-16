//@ts-check
const
    { CronJob } = require("cron").CronJob,
    expiringItemsAlert = require('./alerts/expiringItemsAlert')


//Development
const dailyAlerts = {
    start: () => {
        expiringItemsAlert('seguros')
        expiringItemsAlert('procuracoes')
    }
}


dailyAlerts.start()
module.exports = dailyAlerts


//Production
//const dailyAlerts = new CronJob('* 49 16 * * *', async function () {})