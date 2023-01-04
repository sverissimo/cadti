//ts-check
const { testApi } = require('./api')
const { procuradores } = require('./mockData/addProcuradorMockData')
const { userMockData } = require('./mockData/userMockData')

process.env.NODE_ENV = 'test'

beforeAll(async () => {
    codigoEmpresa = 9060
    const userAddResult = await testApi.post(`/api/users`, userMockData)
    const procuradorIdsString = await testApi.post(`/api/procuradores`, { procuradores: [procuradores[0]], codigoEmpresa })
    procuradorId = JSON.parse(procuradorIdsString)
    console.log("🚀 ~ file: addProcuradorPermissions.test.js:11 ~ beforeAll ~ New user status: ", userAddResult)
})

let userId
//Change this test to addProcuracao instead?
describe('Procuradores -> Testing procuradores permission updates', () => {
    describe('When a authorized user adds a new procurador', () => {
        it('should retrieve userIds', async () => {
            console.log("🚀 ~ file: addProcuradorPermissions.test.js:23 ~ it ~ procuradorId", procuradorId)
            expect(typeof procuradorId).toBe('object')
        })

        it('should insert new user permission to access that empresa\'s data', async () => {
            const result = await testApi.getData(`/api/users?cpf=${procuradores[0].cpf_procurador}`)
            const user = result.data
            userId = user._id
            console.log("🚀 ~ file: addProcuradorPermissions.test.js:24 ~ it ~ User empresas after addProcurador: ", user)
            expect(user.empresas.some(e => e === codigoEmpresa)).toBe(true)
        })
    })

})

afterAll(() => {
    testApi.deleteOne(`/api/users?id=${userId}`)
    console.log(`🚀 ~file: addProcuradorPermissions.test.js: 57 - DB CleanUp: ${procuradorId} DELETED!!`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - MongoDB CleanUp:, ${userId} DELETED!!!`)
})