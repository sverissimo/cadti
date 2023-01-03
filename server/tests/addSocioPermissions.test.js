//ts-check
const { testApi } = require('./api')
const { socios } = require('./mockData/addSociosMockData')
const { userMockData } = require('./mockData/userMockData')

process.env.NODE_ENV = 'test'

beforeAll(async () => {
    codigoEmpresa = 9060
    const userAddResult = await testApi.post(`/api/users`, userMockData)
    const socioIdsString = await testApi.post(`/api/socios`, { socios, codigoEmpresa })
    socioIds = JSON.parse(socioIdsString)
    console.log("🚀 ~ file: addSocioPermissions.test.js:11 ~ beforeAll ~ userAddResult", userAddResult)
})

let userId

describe('Socios -> Testing socios permission updates', () => {
    describe('When a authorized user adds a new socio', () => {
        it('should retrieve userIds', async () => {
            console.log("🚀 ~ file: addSocio.test.js:36 ~ it ~ socio_id", socioIds)
            expect(Array.isArray(socioIds)).toBe(true)
        })
    })

    describe('When a existing user has the same CPF as the socio', () => {
        it('should insert new user permission to access that empresa\'s data', async () => {
            const result = await testApi.getData('/api/users?cpf=111')
            const user = result.data
            userId = user._id
            console.log("🚀 ~ file: addSocioPermissions.test.js:24 ~ it ~ user", user)
            expect(user.empresas.some(e => e === 9060)).toBe(true)
        })
    })
})

afterAll(async () => {
    //************APAGAR USUÁRIO TAMBÉM!!!!!!!!!!!!!!!!
    for (const id of socioIds) {
        testApi.deleteOne(`/api/socios?id=${id}&codigoEmpresa=9060`)
    }
    testApi.deleteOne(`/api/users?id=${userId}`)
    console.log(`🚀 ~file: addSocio.test.js: 44 ~it ~id  ${socioIds} DELETED!!`)
    console.log(`🚀 ~ file: addSocioPermissions.test.js:43 ~ userId, ${userId} DELETED!!!`)
})