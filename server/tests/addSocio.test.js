//ts-check
const { testApi } = require('./api')
const { socios } = require('./mockData/addSociosMockData')

process.env.NODE_ENV = 'test'
let socio_id

describe('Socios -> Adding new socios', () => {
    describe('When a user adds a few socios', () => {
        it('should retrieve an array of socioIds', async () => {
            socioIds = await testApi.post(`/api/socios`, { socios })
            expect(Array.isArray(socio_id)).toBe(true)
        })
    })
})

afterAll(() => {
    for (const id of socioIds) {
        testApi.deleteOne(`/api/socios?id=${id}&codigoEmpresa=9060`, id)
    }
    console.log(`🚀 ~ file: addSocio.test.js:44 ~ it ~ id  ${socioIds} DELETED!!`,)
})
