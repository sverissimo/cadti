//@ts-check
const { SeguroService } = require("../services/SeguroService")
const { VeiculoService } = require("../services/VeiculoService")

const forceDbUpdate = async (req, res) => {

    //Atualiza a tabela de seguros do Postgresql com aqueles que venceram o seguro, mudando o status de cada seguro para "Vencido"
    const SeguroUpdateResult = await SeguroService.checkExpiredInsurances()
    console.log(`updated expired insurances alright. Update result: ${SeguroUpdateResult}`)

    //Atualiza a tabela de veículos do Postgresql de acordo com a situação do seguro e do laudo e atualizando a situação de todos os veículos.
    const VeiculoUpdateResult = await VeiculoService.updateVehicleStatus()
    console.log(`updated expired vehicles alright. Update result: ${VeiculoUpdateResult}`)

    res.send('Postgres update and sync concluded.')
}

module.exports = forceDbUpdate