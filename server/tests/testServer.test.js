//@ts-check
const { testHeaders } = require('./testConfig');
const request = require('supertest');
const app = require('../app');
process.env.NODE_ENV = 'test'


describe('Seguros -> listing all insurances', () => {
    it('Tst serverZZ', async () => {

        const response = await request(app)
            .get('/api/seguradoras')
            .set(testHeaders)

        console.log("🚀 ~ file: seguros.test.js:11 ~ it ~ tst", response.body)

        expect(response.status).toEqual(200)
    })
})
