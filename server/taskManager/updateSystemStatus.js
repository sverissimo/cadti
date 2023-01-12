//@ts-check
const { SeguroService } = require('../services/SeguroService')
const insertNewInsurances = require('./seguros/insertNewInsurances')
const updateVehicleStatus = require('./veiculos/updateVehicleStatus')
const moment = require('moment')

let i = 0
const updateSystemStatus = async () => {
    // checa se um seguro registrado com início de vigência futura iniciou sua vigência. Caso positivo, resgata o seguro do MongoDB e insere no Postgresql
    await insertNewInsurances()
    console.log('new insurances alright')

    //Atualiza a tabela de seguros do Postgresql com aqueles que venceram o seguro, mudando o status de cada seguro para "Vencido"
    const SeguroUpdateResult = await SeguroService.checkExpiredInsurances()
    console.log(`updated expired insurances alright. Update result: ${SeguroUpdateResult}`)


    //Atualiza a tabela de veículos do Postgresql de acordo com a situação do seguros do laudo e atualizando a situação de todos os veículos.
    updateVehicleStatus()
    console.log('updated vehicle data alright')

    i++
    console.log(`Updated ${i} times, once a day. ${moment()}`)
}

module.exports = updateSystemStatus