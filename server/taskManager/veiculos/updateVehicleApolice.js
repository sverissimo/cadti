const axios = require("axios")

//Essa função é rodada dentro do loop da função updateInsurances do arquivo checkInsurances.P ara cada seguro atualizado recebe a apólice e uma array de veiculosId e para cada veículo atualiza a apólice
const updateVehicleApolice = (vehicles, apolice) => {

    const request = {
        table: 'veiculos',
        column: 'apolice',
        tablePK: 'veiculo_id',
        ids: vehicles,
        value: apolice
    }
    console.log('Update vehicle insurance request: ', request)
    axios.put('https://localhost:3001/api/updateInsurances', request)
        .then(r => console.log('Seguro que passa a viger cadastrado nos veículos', r.data))
}

module.exports = updateVehicleApolice