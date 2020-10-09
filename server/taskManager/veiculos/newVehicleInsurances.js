const axios = require("axios")

//Essa função é rodada dentro do loop da função updateInsurances do arquivo checkInsurances.P ara cada seguro atualizado recebe a apólice e uma array de veiculosId e para cada veículo atualiza a apólice
const newVehicleInsurances = (vehicles, apolice) => {

    const request = {
        column: 'apolice',
        tablePK: 'veiculo_id',
        ids: vehicles,
        value: apolice
    }
    console.log(request)
    axios.put('http://localhost:3001/api/updateInsurances', request)
        .then(r => console.log('Seguro que passa a viger cadastrado nos veículos', r.data))
}

module.exports = newVehicleInsurances