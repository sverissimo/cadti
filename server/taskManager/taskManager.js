const
    CronJob = require('cron').CronJob,
    moment = require('moment'),
    insertNewInsurances = require('./seguros/insertNewInsurances'),
    checkExpiredInsurances = require('./seguros/checkExpiredInsurances'),
    updateVehicleStatus = require('./veiculos/updateVehicleStatus')

let
    dailyTasks = { start: () => void 0 },
    i = 0

//DEVELOPMENT ==> 
if (process.env.NODE_ENV !== 'production') {
    dailyTasks = {
        start: async () => {
            //await insertNewInsurances()
            //console.log('new insurances alright')   

            /*   await checkExpiredInsurances()
              console.log('updated expired insurances alright')
  
              updateVehicleStatus()
              console.log('updated vehicle data alright') */
        }
    }
}

//PRODUCTION
else
    dailyTasks = new CronJob('1 * 0 * * *', async function () {

        // checa se um seguro registrado com início de vigência futura iniciou sua vigência. Caso positivo, resgata o seguro do MongoDB e insere no Postgresql 
        await insertNewInsurances()
        console.log('new insurances alright')

        //Atualiza a tabela de seguros do Postgresql com aqueles que venceram o seguro, mudando o status de cada seguro para "Vencido"
        await checkExpiredInsurances()
        console.log('updated expired insurances alright')

        //Atualiza a tabela de veículos do Postgresql de acordo com a situação do seguroe do laudo e atualizando a situação de todos os veículos.
        updateVehicleStatus()
        console.log('updated vehicle data alright')

        i++
        console.log(`Updated ${i} times, once a day. ${moment()}`)

    }, null, true, 'America/Sao_Paulo');

module.exports = dailyTasks