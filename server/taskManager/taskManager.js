const
    CronJob = require('cron').CronJob,
    moment = require('moment'),
    insertNewInsurances = require('./seguros/insertNewInsurances'),
    checkExpiredInsurances = require('./seguros/checkExpiredInsurances')
//expiredVehicleInsurances = require('./veiculos/updateVehicleStatus')

let i = 0

const dailyTasks = new CronJob('30 59 * * * *', async function () {

    //Atualiza a tabela de seguros do Postgresql com aqueles que venceram o seguro, mudando o status de cada seguro para "Vencido"
    // await checkExpiredInsurances()
    //console.log('insurances expired alright')
    //Atualiza a tabela de veículos do Postgresql com aqueles que venceram o seguro, mudando o status de cada veículo para "Seguro Vencido"
    //await expiredVehicleInsurances()
    //console.log('vehiclesIns expired alright')
    // checa se um seguro registrado com início de vigência futura iniciou sua vigência. Caso positivo, resgata o seguro do MongoDB e insere no Postgresql 
    insertNewInsurances()
    console.log('new insurances alright')

    i++
    console.log(`Updated ${i} times, once a day. ${moment()}`)
}, null, true, 'America/Sao_Paulo');

module.exports = dailyTasks


//Faz os GET requests para evitar que cada módulo faça repetidos