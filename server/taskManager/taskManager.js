const
    CronJob = require('cron').CronJob,
    moment = require('moment'),
    { checkExpiredInsurances, updateInsurances } = require('./checkInsurances')

let i = 0

const dailyTasks = new CronJob('* * 0 * * *', function () {
    i++
    console.log(`Updated ${i} times, once a day. ${moment()}`);
    //Atualiza as tabelas veiculos e seguros do Postgresql com aqueles que venceram o seguro, mudando o status de cada elemento para "Seguro Vencido"
    checkExpiredInsurances()
    // checa se um seguro registrado com início de vigência futura iniciou sua vigência. Caso positivo, resgata o seguro do MongoDB e insere no Postgresql 
    updateInsurances()

}, null, true, 'America/Sao_Paulo');

module.exports = dailyTasks