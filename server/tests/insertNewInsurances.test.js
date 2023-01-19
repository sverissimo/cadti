//@ts-check
const segurosModel = require("../mongo/models/segurosModel")
const { Repository } = require("../repositories/Repository")
const { SeguroService } = require("../services/SeguroService")
const { addUpcomingSegurosMockData, vehiclesFromInsurancesMockData } = require("./mockData/addUpcomingSegurosMockData")

/**
 * Esse teste depende dos dados do arquivo addUpcomingSegurosMockData.js como estão para funcionar
 * Um dos 5 seguros é cadastrado antes de começar o teste, para simular a atualização de apólice
 * Dois veículos são cadastrados sem apólice e com situacao === 'Cadastro solicitado'
 * Um veículo é cadastrado como ativo e apolice === '99993'
 * Antes de chamar a função, 5 seguros são salvos no MongoDB, 2 com data de emissão anterior e 3 com datas futuras
 * Após chamar a função insertNewInsurances com os dados pré-definidos, espera-se que:
 * 3 seguros permaneçam salvos no MongoDB sendo que 2 transferidos para o Postgresql e removidos do MongoDB
 * os veículos sem seguro passam a ter a apólice 99994 e o que tinha apólice passa a não ter nenhuma
 */

process.env.NODE_ENV = 'test'
let conn

beforeAll(async () => {
    conn = require("../mongo/mongoConfig").conn
    await seguroRepository.save(addUpcomingSegurosMockData[2])
})

afterAll(async () => {
    await segurosModel.deleteMany({ _id: { $in: ids } })
    const apolices = addUpcomingSegurosMockData.map(({ apolice }) => apolice)
    for (const apolice of apolices) {
        await new Repository('seguros', 'apolice').delete(apolice)
    }

    for (const vehicleId of vehicleIds) {
        await new Repository('veiculos', 'veiculo_id').delete(vehicleId)
    }

    await conn.close()
})

const ids = []
const veiculoRepository = new Repository('veiculos', 'veiculo_id')
const seguroRepository = new Repository('seguros', 'id')
const vehicleIds = []
let veiculos = []
let newInsurances

describe('Testing insertNewInsurances method', () => {
    it('Given some insurances are added the MongoDB and some vehicles have some of their apolice number ', async () => {
        for (const veiculo of vehiclesFromInsurancesMockData) {
            const vehicleId = await veiculoRepository.save(veiculo)
            vehicleIds.push(vehicleId)
        }

        addUpcomingSegurosMockData[2].veiculos = []
        addUpcomingSegurosMockData[3].veiculos = [vehicleIds[0], vehicleIds[1]]
        newInsurances = await segurosModel.insertMany(addUpcomingSegurosMockData)
        newInsurances.forEach(({ _id }) => ids.push(_id))
        expect(newInsurances.length).toBe(5)
    })

    it('When the function insertUpdatedInsurances is called', async () => {
        const { deletedCount } = await SeguroService.insertNewInsurances()
        console.log("🚀 ~ file: insertNewInsurances.test.js:42 ~ insertUpdatedInsurances is called',deletedCount", deletedCount)
        expect(deletedCount).toBe(2)
    })

    it('Then new insurances should be inserted to Postgresql if their starting day is today', async () => {
        const apolices = addUpcomingSegurosMockData.map(({ apolice }) => apolice)
        const newInsurances = await seguroRepository.find({ apolice: apolices })
        expect(newInsurances.length).toBe(2)
        expect(newInsurances.some(s => s.apolice === '99993')).toBe(true)
        expect(newInsurances.some(s => s.apolice === '99994')).toBe(true)
        //console.log("🚀 ~ file: insertNewInsurances.test.js:57 ~ it ~ newInsurances", newInsurances)
    })

    it('Then the vehicles added should have their "apolice" column updated.', async () => {
        veiculos = await veiculoRepository.find(vehicleIds)
        const shouldBeActive = veiculos.find(v => v.placa === 'EEE-0005')
        const shouldBeExpired = veiculos.find(v => v.placa === 'FFF-0F06')
        expect(shouldBeActive.situacao).toBe('Ativo')
        expect(shouldBeActive.apolice).toBe('99994')
        expect(shouldBeExpired.situacao).toBe('Seguro vencido')
        expect(shouldBeExpired.apolice).toBe('Seguro não cadastrado')
        /* console.log("🚀 ~ file: insertNewInsurances.test.js:40 ~ it ~ vehicleIds", veiculos.map(
            ({ veiculo_id, placa, apolice, situacao }) => ({ veiculo_id, placa, apolice, situacao })
        )) */
    })
})