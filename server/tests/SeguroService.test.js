//@ts-check
const request = require('supertest');
const app = require('../app');
const { SeguroService } = require('../services/SeguroService');
const { testHeaders } = require('./testConfig');
const { addSegurosMockData } = require('./mockData/addSegurosMockData');

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
const seguroIds = []

beforeAll(async () => {
    for (const seguro of addSegurosMockData) {
        const addSegurosResult = await agent.post('/api/seguros')
            .set(testHeaders)
            .send(seguro)
        const seguroId = addSegurosResult.body
        seguroIds.push(seguroId)
    }
    console.log("🚀 ~ file: SeguroService.test.js:35 ~ beforeAll ~ seguroIds", seguroIds)
})

afterAll((done) => {
    for (const seguroId of seguroIds) {
        agent.delete(`/api/delete?table=seguros&tablePK=id&id=${seguroId}`)
            .set(testHeaders)
            .end(done)
    }
})

describe('Testing SeguroService >> checkExpiredInsurances method', () => {
    describe('When a user query for recently uploaded insurances', () => {
        it('should retrieve insurances with situacao = null', async () => {
            const response = await agent.get(`/api/seguros?id=${seguroIds.join()}`)
                .set(testHeaders)
            const insurancesBeforeUpdate = response.body
            expect(insurancesBeforeUpdate.every(i => i.situacao === "Vigente")).toBe(true)
        })
    })

    describe('When a user runs the updateSystemInsurances function', () => {
        it('should update each seguro status accordingly to its expiration date', async () => {
            await SeguroService.checkExpiredInsurances()
            const segurosQueryResult = await agent.get(`/api/seguros?id=${seguroIds.join()}`)
                .set(testHeaders)
            const updatedSeguros = segurosQueryResult.body

            expect(updatedSeguros.length).toBe(5)
            expect(updatedSeguros.some(i => i.situacao === 'Vigente')).toBe(true)
            expect(updatedSeguros[0].situacao).toBe('Vencido')
            expect(updatedSeguros[4].situacao).toBe('Vigente')
        })
    })
})

