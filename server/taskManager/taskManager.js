const updateVehicleStatus = require('./veiculos/updateVehicleStatus')

const
    CronJob = require('cron').CronJob,
    moment = require('moment'),
    insertNewInsurances = require('./seguros/insertNewInsurances'),
    checkExpiredInsurances = require('./seguros/checkExpiredInsurances'),
    { getUpdatedData } = require('../getUpdatedData')
//expiredVehicleInsurances = require('./veiculos/updateVehicleStatus')

let i = 0

//const dailyTasks = new CronJob('30 59 * * * *', async function () {

const dailyTasks = async () => {
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
}
/* , null, true, 'America/Sao_Paulo'); */

module.exports = dailyTasks


//caso se opte por enviar sockets após as atualizações diárias
const updateSockets = io => {
    getCollections = ['seguros', 'veiculos']

    getCollections.forEach(async col => {
        const data = getUpdatedData(col)
        try {
            data.then(async r => {
                console.log('fkr ', typeof r, r[0])
                await io.sockets.emit('updateElements', r)
            })
        }
        catch (err) {
            console.log('*********************\n\n', err, '*************************************\n\n')
        }
    })
}

//Faz os GET requests para evitar que cada módulo faça repetidos