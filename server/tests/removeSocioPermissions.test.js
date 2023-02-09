//ts-check
const { socios, cpfsToRemove, codigoEmpresa } = require('./mockData/removeSociosMockData')
const request = require('supertest');
const app = require('../app');
const { testHeaders } = require('./testConfig');

process.env.NODE_ENV = 'test'

jest.setTimeout(18000)
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
process.env.NODE_ENV = 'test'

describe('When a authorized user removes a socio from a empresa', () => {
    it('Should update the socio\'s empresas array', async () => {
        await agent.put(`/api/socios`)
            .set(testHeaders)
            .send({ socios, cpfsToRemove, codigoEmpresa })
    })
})

/* it('Authorization for that codigoEmpresa should be removed from user with same CPF', async () => {
    const result = await testApi.getData('/api/users?cpf=111')
    const user = result.data
    console.log("🚀 ~ file: addSocioPermissions.test.js:46 ~ userEmpresas after deleteSocio: ", user.empresas)
    expect(user.empresas.some(e => e === codigoEmpresa)).toBe(false)
})
})


afterAll(() => {
testApi.deleteOne(`/api/users?id=${userId}`)
console.log(`🚀 ~file: addSocioPermissions.test.js: 57 - DB CleanUp: ${socioId} DELETED!!`)
console.log(`🚀 ~ file: addSocioPermissions.test.js:58 - MongoDB CleanUp:, ${userId} DELETED!!!`)
}) */

/* beforeAll(async () => {
    codigoEmpresa = 9060
    const userAddResult = await testApi.post(`/api/users`, userMockData)
    const socioIdsString = await testApi.post(`/api/socios`, { socios: [socios[0]], codigoEmpresa })
    socioId = JSON.parse(socioIdsString).toString()
    console.log("🚀 ~ file: addSocioPermissions.test.js:11 ~ beforeAll ~ New user status: ", userAddResult)
})
 */