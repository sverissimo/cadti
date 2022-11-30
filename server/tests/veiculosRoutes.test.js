const { getData } = require('./api')
process.env.NODE_ENV = 'test'


describe('Veiculos -> listing all insurances', () => {
    it('Should return at least one record with all SeguroModel properties', async () => {

        const res = await getData('/api/allVehicles?codigoEmpresa=9060')
        console.log(res.data.length)
        expect(res.status).toEqual(200)
    })

})

describe('Seguros -> cadastrando um novo seguro', () => {
    it('Should save the passed object to the test DB', () => {

        console.log('To be implemented...')
    })

})


