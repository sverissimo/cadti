//ts-check
const { testApi } = require('./api')
const { userMockData } = require('./mockData/addUserMockData')

process.env.NODE_ENV = 'test'

describe('Users -> Testing add user', () => {
    describe('When a new user is created', () => {
        it('should return status 200', async () => {
            const addUserResult = await testApi.post(`/api/users`, userMockData)
            console.log("🚀 ~ file: addSocioPermissions.test.js:12 ~ beforeAll ~ addUserResult", addUserResult)
        })
    })
})


