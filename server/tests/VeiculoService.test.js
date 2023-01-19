//@ts-check
const request = require('supertest');
const app = require('../app');
const { VeiculoService } = require('../services/VeiculoService');
const { testHeaders } = require('./testConfig');
const { addVeiculosMockData } = require('./mockData/addVeiculosMockData');
const VeiculoRepository = require('../repositories/VeiculoRepository');

process.env.NODE_ENV = 'test'

jest.setTimeout(12000)
jest.mock('../sockets/CustomSocket', () => {
    return {
        CustomSocket: jest.fn().mockImplementation(() => {
            return {
                io: { sockets: { sockets: [] } },
                emit: () => void 0,
                delete: () => void 0
            }
        })
    }
})

jest.mock('../routes/fileRoutes', () => ({ fileRouter: (app) => void 0 }))

const agent = request(app)
const veiculoIds = []
const apolice = '9999'

beforeAll(async () => {
    for (const veiculo of addVeiculosMockData) {
        const addVeiculosResult = await agent.post('/api/veiculos')
            .set(testHeaders)
            .send(veiculo)
        const veiculoId = addVeiculosResult.body
        veiculoIds.push(veiculoId)
    }
    console.log("🚀 ~ file: VeiculoService.test.js:35 ~ beforeAll ~ veiculoIds", veiculoIds)
})

afterAll((done) => {
    for (const veiculoId of veiculoIds) {
        agent.delete(`/api/delete?table=veiculos&tablePK=veiculo_id&id=${veiculoId}`)
            .set(testHeaders)
            .end(done)
    }
})

describe('Testing VeiculoService >> updateVehicleInsurances method', () => {
    describe('Given there are recently uploaded vehicles with situacao = "Cadastro solicitado"', () => {
        it('should retrieve vehicles with situacao = "Seguro não cadastrado"', async () => {
            const response = await agent.get(`/api/veiculos?veiculo_id=${veiculoIds.join()}`)
                .set(testHeaders)
            const vehiclesBeforeUpdate = response.body
            console.log("🚀 ~ file: VeicUloService.test.js:55 ~ it ~ vehiclesBeforeUpdate", vehiclesBeforeUpdate.map(({ placa, apolice, situacao }) => ({ placa, apolice, situacao })))
            expect(vehiclesBeforeUpdate.every(v => v.situacao === "Cadastro solicitado")).toBe(true)
        })

        it('When updateVehicleInsurances is called method with vehicleIds (ADD args)', async () => {
            console.log("🚀 ~ file: VeicUloService.test.js:61 ~ it ~ veiculoIds", veiculoIds)
            const addSeguroResult = await VeiculoService.updateVehiclesInsurance({ apolice, vehicleIds: veiculoIds })
            expect(addSeguroResult).toBe(true)
        })

        it('Then all vehicle apolice should match informed apolice', async () => {
            const veiculos = await new VeiculoRepository().find(veiculoIds)
            console.log("🚀 ~ file: VeicUloService.test.js:67 ~ it ~ vehicles AFTER_ADD", veiculos.map(({ placa, apolice, situacao }) => ({ placa, apolice, situacao })))
            expect(veiculos.every(v => v.apolice === apolice)).toBe(true)
            expect(veiculos.every(v => v.situacao === 'Ativo')).toBe(true)
        })

        it('When updateVehicleInsurances is called method with deletedVehicleIds (REMOVE args)', async () => {
            const removeSeguroResult = await VeiculoService.updateVehiclesInsurance({ apolice, deletedVehicleIds: veiculoIds })
            expect(removeSeguroResult).toBe(true)
        })

        it('Then all vehicles\'s situacao should be "Seguro não cadastrado" and apolice should be null', async () => {
            const veiculos = await new VeiculoRepository().find(veiculoIds)
            console.log("🚀 ~ file: VeicUloService.test.js:79 ~ it ~ vehicles AFTER DELETE", veiculos.map(({ placa, apolice, situacao }) => ({ placa, apolice, situacao })))
            expect(veiculos.length).toBe(3)
            expect(veiculos.every(v => v.apolice === 'Seguro não cadastrado')).toBe(true)
            expect(veiculos.every(v => v.situacao === 'Seguro vencido')).toBe(true)
        })
    })
})
