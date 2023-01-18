//@ts-check
const { SeguroService } = require('../services/SeguroService')
const insertNewInsurances = require('./seguros/insertNewInsurances')
const { VeiculoService } = require('../services/VeiculoService')

let i = 0
const updateSystemStatus = async () => {
    // checa se um seguro registrado com início de vigência futura iniciou sua vigência. Caso positivo, resgata o seguro do MongoDB e insere no Postgresql
    await insertNewInsurances()
    console.log('new insurances alright')

    //Atualiza a tabela de seguros do Postgresql com aqueles que venceram o seguro, mudando o status de cada seguro para "Vencido"
    const SeguroUpdateResult = await SeguroService.checkExpiredInsurances()
    console.log(`updated expired insurances alright. Update result: ${SeguroUpdateResult}`)

    //Atualiza a tabela de veículos do Postgresql de acordo com a situação do seguros do laudo e atualizando a situação de todos os veículos.
    const VeiculoUpdateResult = await VeiculoService.updateVehicleStatus()
    console.log(`updated expired vehicles alright. Update result: ${VeiculoUpdateResult}`)

    i++
    const currentDate = new Date().toISOString()
    console.log(`Updated ${i} times, once a day. Last updated: ${currentDate}`)
}

module.exports = updateSystemStatus