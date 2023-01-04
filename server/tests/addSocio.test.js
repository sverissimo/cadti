//ts-check
const { testApi } = require('./api')
const { socios } = require('./mockData/addSociosMockData')
const { userMockData } = require('./mockData/userMockData')

process.env.NODE_ENV = 'test'

beforeAll(async () => {
    codigoEmpresa = 9060
    const userAddResult = await testApi.post(`/api/users`, userMockData)
    console.log("🚀 ~ file: addSocioPermissions.test.js:11 ~ beforeAll ~ userAddResult", userAddResult)
})

let userId

describe('Socios -> Testing adding new socios', () => {
    describe('When a authorized user adds new socios', () => {
        it('should retrieve userIds', async () => {
            const socioIdsString = await testApi.post(`/api/socios`, { socios, codigoEmpresa })
            socioIds = JSON.parse(socioIdsString)
            console.log("🚀 ~ file: addSocio.test.js:36 ~ it ~ socio_id", socioIds)
            expect(Array.isArray(socioIds)).toBe(true)
        })

        it('should insert new user permission to access that empresa\'s data', async () => {
            const result = await testApi.getData(`/api/users?cpf=${socios[0].cpf_socio}`)
            const user = result.data
            userId = user._id
            console.log("🚀 ~ file: addSocioPermissions.test.js:24 ~ it ~ user", user)
            expect(user.empresas.some(e => e === codigoEmpresa)).toBe(true)
        })
    })
})

afterAll(async () => {
    testApi.deleteOne(`/api/users?id=${userId}`)
    for (const id of socioIds.concat([494, 495])) {
        testApi.deleteOne(`/api/socios?id=${id}&codigoEmpresa=${codigoEmpresa}`)
    }
    console.log(`🚀 ~file: addSocioPermissions.test.js: 57 - DB CleanUp: ${socioIds} DELETED!!`)
    console.log(`🚀 ~ file: addSocioPermissions.test.js:58 - MongoDB CleanUp:, ${userId} DELETED!!!`)
})