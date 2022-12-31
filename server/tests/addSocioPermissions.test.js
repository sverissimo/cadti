//ts-check
const { testApi } = require('./api')
const { socios } = require('./mockData/addSociosMockData')
const { userMockData } = require('./mockData/userMockData')

process.env.NODE_ENV = 'test'

beforeAll(async () => {

    const addUserResult = await testApi.post(`/api/users`, userMockData)
    console.log("🚀 ~ file: addSocioPermissions.test.js:12 ~ beforeAll ~ addUserResult", addUserResult)
    socioIds = await testApi.post(`/api/socios`, { socios })
})


describe('Socios -> Testing socios permission updates', () => {
    describe('When a user with same cpf exists', () => {
        it('should retrieve userIds', async () => {
            console.log("🚀 ~ file: addSocio.test.js:36 ~ it ~ socio_id", socioIds)
            expect(Array.isArray(socioIds)).toBe(true)
        })
    })

    it('should delete socioIds', () => {
        for (const id of socioIds) {
            testApi.deleteOne(`/api/socios?id=${id}&codigoEmpresa=9060`)
        }
        console.log(`🚀 ~ file: addSocio.test.js:44 ~ it ~ id  ${socioIds} DELETED!!`,)
    })

    /*  it('Should return at least one socio_id and add permission to user', async () => {

         const res = await getData('/api/allVehicles?codigoEmpresa=9060')
         console.log(res.data.length)
         expect(res.status).toEqual(200)
     }) */

})


