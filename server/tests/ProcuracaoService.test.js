//ts-check
const { testApi } = require('./api')
const { procuracao } = require('./mockData/addProcuracaoMockData')
const { userMockData } = require('./mockData/userMockData')

process.env.NODE_ENV = 'test'

beforeAll(async () => {
    codigoEmpresa = 9060
    const userAddResult = await testApi.post(`/api/users`, userMockData)
    const procuracaoIdsString = await testApi.post(`/api/procuracoes`, procuracao)
    procuracaoId = Number(procuracaoIdsString)
    console.log("🚀 ~ file: addProcuradorPermissions.test.js:11 ~ beforeAll ~ New user status: ", userAddResult)
})

let userId
//Change this test to addProcuracao instead?
describe('Procurações -> Testing ProcuracaoService', () => {
    describe('When a authorized user adds a new procuracao', () => {
        it('should retrieve the procuracao ID', async () => {
            console.log("🚀 ~ file: addProcuradorPermissions.test.js:23 ~ it ~ procuracaoId", procuracaoId)
            newProcuracao = await testApi.getData(`/api/procuracoes?procuracao_id=${procuracaoId}`)
            console.log("🚀 ~ file: ProcuracaoService.test.js:25 ~ it ~ procuracao", newProcuracao)
            expect(typeof procuracaoId).toBe('number')
        })

        it('should add codigoEmpresa to procuradores\' empresasArray.', async () => {
            procuradorIds = newProcuracao.data[0].procuradores
            console.log("🚀 ~ file: ProcuracaoService.test.js:29 ~ it ~ procuradorIds", procuradorIds)

            const procuradoresResult = await testApi.getData(`/api/procuradores/${procuradorIds.join()}`)

            procurador = procuradoresResult.data[0]
            console.log("🚀 ~ file: ProcuracaoService.test.js:32 ~ it ~ procuradorEmpresas", procurador.empresas)
            expect(procurador.empresas.some(e => e === codigoEmpresa)).toBe(true)
        })
        it('should insert new user permission to access that empresa\'s data', async () => {
            const result = await testApi.getData(`/api/users?cpf=${procurador.cpf_procurador}`)
            const user = result.data
            userId = user._id
            console.log("🚀 ~ file: addProcuradorPermissions.test.js:24 ~ it ~ UserEmpresas after addProcuracao: ", user.empresas)
            expect(user.empresas.some(e => e === codigoEmpresa)).toBe(true)
        })
    })

    describe('When a authorized user deletes a procuracao', () => {
        it('should remove empresa from procuradores empresasArray', async () => {
            (async () => {
                await testApi.deleteOne(`/api/procuracoes?id=${procuracaoId}`)
                return true
            })()

            const procuradoresResult = await testApi.getData(`/api/procuradores/${procuradorIds.join()}`)
            const updatedProcurador = procuradoresResult.data[0]
            console.log("🚀 ~ file: ProcuracaoService.test.js:56 ~ it ~ procuradoresEmpresas AFTER DELETE: ", updatedProcurador.empresas)
            expect(updatedProcurador.empresas.some(e => e === codigoEmpresa)).toBe(false)
        })

        it('should remove empresa from USER empresasArray (remove permission)', async () => {
            const result = await testApi.getData(`/api/users?cpf=${procurador.cpf_procurador}`)
            const user = result.data
            console.log("🚀 ~ file: addProcuradorPermissions.test.js:63 ~ it ~ UserEmpresas after DELETE: ", user.empresas)
            expect(user.empresas.some(e => e === codigoEmpresa)).toBe(false)
        })
    })

})

afterAll(() => {
    testApi.deleteOne(`/api/users?id=${userId}`)
    console.log(`🚀 ~file: addProcuradorPermissions.test.js: 57 - DB CleanUp: ${procuracaoId} DELETED!!`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - MongoDB CleanUp:, ${userId} DELETED!!!`)
})