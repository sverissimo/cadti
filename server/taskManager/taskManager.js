const expiredVehicleInsurances = require('./veiculos/expiredVehicleInsurances');

const
    CronJob = require('cron').CronJob,
    moment = require('moment'),
    insertNewInsurances = require('./seguros/insertNewInsurances'),
    checkExpiredInsurances = require('./seguros/checkExpiredInsurances')
expiredVehicleInsurances = require('./veiculos/expiredVehicleInsurances')

let i = 0

const dailyTasks = new CronJob('* * 0 * * *', function () {
    i++
    console.log(`Updated ${i} times, once a day. ${moment()}`);
    //Atualiza a tabela de seguros do Postgresql com aqueles que venceram o seguro, mudando o status de cada seguro para "Vencido"
    checkExpiredInsurances()
    //Atualiza a tabela de veículos do Postgresql com aqueles que venceram o seguro, mudando o status de cada veículo para "Seguro Vencido"
    expiredVehicleInsurances()
    // checa se um seguro registrado com início de vigência futura iniciou sua vigência. Caso positivo, resgata o seguro do MongoDB e insere no Postgresql 
    insertNewInsurances()


}, null, true, 'America/Sao_Paulo');

module.exports = dailyTasks