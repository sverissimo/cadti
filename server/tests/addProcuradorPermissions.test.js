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
/*
describe('When a authorized user deletes a procurador', () => {
        it('Should delete the procurador', async () => {
            (async () => await testApi.deleteOne(`/api/procuradores?id=${procuradorId}&codigoEmpresa=${codigoEmpresa}`))()
        })

        it('Should not be found on DB', async () => {
            const result = await testApi.getData(`/api/procuradores?procurador_id=${procuradorId}`)
            const procuradoresFound = result.data
            console.log("🚀 ~ file: addProcuradorPermissions.test.js:41 ~ it ~ procuradoresFound", procuradoresFound)
            expect(procuradoresFound.length).toBe(0)
        })

        it('Authorization for that codigoEmpresa should be removed from user(s) with same CPF', async () => {
            const result = await testApi.getData('/api/users?cpf=111')
            const user = result.data
            console.log("🚀 ~ file: addProcuradorPermissions.test.js:46 ~ userEmpresas after deleteProcurador: ", user.empresas)
            expect(user.empresas.some(e => e === codigoEmpresa)).toBe(false)
        })
    })
})
 */
afterAll(() => {
    testApi.deleteOne(`/api/users?id=${userId}`)
    console.log(`🚀 ~file: addProcuradorPermissions.test.js: 57 - DB CleanUp: ${procuradorId} DELETED!!`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - MongoDB CleanUp:, ${userId} DELETED!!!`)
})