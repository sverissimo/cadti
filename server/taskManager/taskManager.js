const
    CronJob = require('cron').CronJob,
    moment = require('moment'),
    { checkInsurances } = require('./checkInsurances')

let i = 0

const dailyTasks = new CronJob('* * 0 * * *', function () {
    i++
    console.log(`Updated ${i} times, once a day. ${moment()}`);
    checkInsurances()

}, null, true, 'America/Sao_Paulo');

module.exports = dailyTasks