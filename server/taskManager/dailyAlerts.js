//@ts-check
const
    { CronJob } = require("cron").CronJob,
    expiringInsurancesAlert = require('./alerts/expiringInsurancesAlert')


//Development
const dailyAlerts = {
    start: () => {
        expiringInsurancesAlert()
    }
}



module.exports = dailyAlerts


//Production
//const dailyAlerts = new CronJob('* 49 16 * * *', async function () {})