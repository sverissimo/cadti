const { testHeaders } = require('./testConfig');
const server = require('../server');
const request = require('supertest');
process.env.NODE_ENV = 'test'


describe('Seguros -> listing all insurances', () => {
    it('Should return at least one record with all SeguroModel properties', async () => {

        const response = await request(server)
            .get('/api/modelosChassi')
            .set(testHeaders)
        console.log("🚀 ~ file: seguros.test.js:11 ~ it ~ tst", response.body)

        expect(response.status).toEqual(200)

    })

})

describe('Seguros -> cadastrando um novo seguro', () => {
    it('Should save the passed object to the test DB', () => {

        console.log('To be implemented...')
    })

})