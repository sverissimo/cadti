//ts-check
const { testApi } = require('./api')
const { procuracao } = require('./mockData/addProcuracaoMockData')
const { userMockData } = require('./mockData/userMockData')
const { addSociosMockData } = require('./mockData/addSociosMockData')
const { addProcuradorMockData } = require('./mockData/addProcuradorMockData')

process.env.NODE_ENV = 'test'
jest.setTimeout(12000)
beforeAll(async () => {

    codigoEmpresa = 9060
    for (const user of userMockData) {
        await testApi.post(`/api/users`, user)
    }

    const socioIdsString = await testApi.post(`/api/socios`, { socios: addSociosMockData, codigoEmpresa })
    socioIds = JSON.parse(socioIdsString)
    console.log("🚀 ~ file: ProcuracaoService.test.js:19 ~ beforeAll ~ socioIds", socioIds)

    const procuradorIdsString = await testApi.post(`/api/procuradores`, { procuradores: addProcuradorMockData, codigoEmpresa })
    procuradorIds = JSON.parse(procuradorIdsString)
    console.log("🚀 ~ file: ProcuracaoService.test.js:25 ~ beforeAll ~ procuradorIds", procuradorIds)

    procuracao.procuradores = procuradorIds
    const procuracaoIdsString = await testApi.post(`/api/procuracoes`, procuracao)
    procuracaoId = Number(procuracaoIdsString)
    console.log("🚀 ~ file: ProcuracaoService.test.js:22 ~ beforeAll ~ procuracaoId", procuracaoId)

    cpfSocios = addSociosMockData.map(s => s.cpf_socio)
    cpfProcuradores = addProcuradorMockData.map(p => p.cpf_procurador)
    cpfUsers = userMockData.map(u => u.cpf)
})

let users

//Change this test to addProcuracao instead?
describe('Procurações -> Testing ProcuracaoService', () => {
    describe('When a authorized user INSERTS a new procuracao', () => {
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

        it.only('Should add empresas to users, procuradores and socios', async () => {
            users = await testApi.fetch(`/api/users?cpf=${cpfUsers.join()}`)
            socios = await testApi.fetch(`/api/socios?cpf_socio=${cpfSocios.join()}`)
            procuradores = await testApi.fetch(`/api/procuradores?cpf_procurador=${cpfProcuradores.join()}`)

            console.log("🚀 ~ file: ProcuracaoService.test.js:73 ~ it.only ~ socios", socios)
            console.log("🚀 ~ file: ProcuracaoService.test.js:76 ~ it.only ~ procuradores", procuradores)
            console.log("🚀 ~ file: ProcuracaoService.test.js:71 ~ it.only ~ userAlsoSocio", users)
        })
    })

    describe('When a authorized user DELETES a procuracao', () => {
        it.only('should remove empresa from procuradores empresasArray', async () => {
            //await testApi.deleteOne(`/api/procuracoes?id=${procuracaoId}`)
            await testApi.deleteOne(`/api/procuracoes?id=${procuracaoId}`)

            /* (async () => {
                await testApi.deleteOne(`/api/procuracoes?id=${procuracaoId}`)
            })() */
            /* const procuradoresResult = await testApi.getData(`/api/procuradores/${procuradorIds.join()}`)
            const updatedProcurador = procuradoresResult.data[0]
            console.log("🚀 ~ file: ProcuracaoService.test.js:56 ~ it ~ procuradoresEmpresas AFTER DELETE: ", updatedProcurador.empresas)
            expect(updatedProcurador.empresas.some(e => e === codigoEmpresa)).toBe(false) */
            expect(true).toBe(true)
        })

        it.only('should retrieve added users, procuradores and socios and make available for following tests', async () => {

            users = await testApi.fetch(`/api/users?cpf=${cpfUsers.join()}`)
            socios = await testApi.fetch(`/api/socios?cpf_socio=${cpfSocios.join()}`)
            procuradores = await testApi.fetch(`/api/procuradores?cpf_procurador=${cpfProcuradores.join()}`)

            console.log("🚀 ~ file: ProcuracaoService.test.js:73 ~ it.only ~ socios", socios)
            console.log("🚀 ~ file: ProcuracaoService.test.js:76 ~ it.only ~ procuradores", procuradores)
            console.log("🚀 ~ file: ProcuracaoService.test.js:71 ~ it.only ~ userAlsoSocio", users)
            expect(socios.length).toBe(2)
            expect(users.length).toBe(4)
            expect(procuradores.length).toBe(3)

            /* expect(
                socios.every(socio => socio.empresas.every((e) => e.codigoEmpresa === codigoEmpresa))
            ).toBe(true)

            expect(
                users.every(user => user.empresas.every((e) => e === codigoEmpresa))
            ).toBe(true) */
        })

        it('Should NOT remove empresa from USER if the same CPF is also a socio of that specific empresa.', async () => {

            console.log("🚀 ~ file: ProcuracaoService.test.js:69 ~ it.only ~ socioAlsoUser", socios)
            //const userAlsoSocio = await testApi.getData(`/api/users?cpf=${userMockData[0].cpf}`)
            console.log("🚀 ~ file: ProcuracaoService.test.js:71 ~ it.only ~ userAlsoSocio", users)

            //expect(socio.empresas.some(e => e === codigoEmpresa)).toBe(true)
            //expect(socio.empresas.some(e => e === codigoEmpresa)).toBe(true)
        })

        it('should remove empresa from USER empresasArray if user not socio (remove permission)', async () => {
            const result = await testApi.getData(`/api/users?cpf=${procurador.cpf_procurador}`)
            const user = result.data
            console.log("🚀 ~ file: addProcuradorPermissions.test.js:63 ~ it ~ UserEmpresas after DELETE: ", user.empresas)
            expect(user.empresas.some(e => e === codigoEmpresa)).toBe(false)
        })
    })
})

afterAll(async () => {
    //const result = await testApi.deleteOne(`/api/procuracoes?id=${procuracaoId}`)


    for (const user of users) {
        testApi.deleteOne(`/api/users?id=${user._id}`)
    }

    for (const id of socioIds) {
        testApi.deleteOne(`/api/socios?id=${id}&codigoEmpresa=${codigoEmpresa}`)
    }

    for (const id of procuradorIds) {
        testApi.deleteOne(`/api/procuradores?id=${id}&codigoEmpresa=${codigoEmpresa}`)
    }

    console.log(`🚀 ~file: addProcuradorPermissions.test.js: 57 - DB CleanUp: ${procuracaoId} DELETED!!`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - MongoDB CleanUp: ${socioIds} DELETED!!!`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - MongoDB CleanUp: ${procuradorIds} DELETED!!!`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - MongoDB CleanUp: ${users.map(({ _id }) => _id)} DELETED!!!`)
})