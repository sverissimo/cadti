//ts-check
const { testApi } = require('./api')
const { socios } = require('./mockData/addSociosMockData')
const { userMockData } = require('./mockData/addUserMockData')

process.env.NODE_ENV = 'test'

beforeAll(async () => {
    codigoEmpresa = 9060
    const userAddResult = await testApi.post(`/api/users`, userMockData)
    const socioIdsString = await testApi.post(`/api/socios`, { socios: [socios[0]], codigoEmpresa })
    socioId = JSON.parse(socioIdsString).toString()
    console.log("🚀 ~ file: addSocioPermissions.test.js:11 ~ beforeAll ~ New user status: ", userAddResult)
})

let userId

describe('Socios -> Testing socios permission updates', () => {
    describe('When a authorized user adds a new socio', () => {
        it('should retrieve userIds', async () => {
            expect(typeof socioId).toBe('string')
        })

        it('should insert new user permission to access that empresa\'s data', async () => {
            const result = await testApi.getData(`/api/users?cpf=${socios[0].cpf_socio}`)
            const user = result.data
            userId = user._id
            console.log("🚀 ~ file: addSocioPermissions.test.js:24 ~ it ~ User empresas after addSocio: ", user.empresas)
            expect(user.empresas.some(e => e === codigoEmpresa)).toBe(true)
        })
    })

    describe('When a authorized user deletes a socio', () => {
        it('Should delete the socio', async () => {
            (async () => await testApi.deleteOne(`/api/socios?id=${socioId}&codigoEmpresa=${codigoEmpresa}`))()
        })

        it('Should not be found on DB', async () => {
            const result = await testApi.getData(`/api/socios?socio_id=${socioId}`)
            const sociosFound = result.data
            console.log("🚀 ~ file: addSocioPermissions.test.js:41 ~ it ~ sociosFound", sociosFound)
            expect(sociosFound.length).toBe(0)
        })

        it('Authorization for that codigoEmpresa should be removed from user with same CPF', async () => {
            const result = await testApi.getData('/api/users?cpf=111')
            const user = result.data
            console.log("🚀 ~ file: addSocioPermissions.test.js:46 ~ userEmpresas after deleteSocio: ", user.empresas)
            expect(user.empresas.some(e => e === codigoEmpresa)).toBe(false)
        })
    })
})

afterAll(() => {
    testApi.deleteOne(`/api/users?id=${userId}`)
    console.log(`🚀 ~file: addSocioPermissions.test.js: 57 - DB CleanUp: ${socioId} DELETED!!`)
    console.log(`🚀 ~ file: addSocioPermissions.test.js:58 - MongoDB CleanUp:, ${userId} DELETED!!!`)
})