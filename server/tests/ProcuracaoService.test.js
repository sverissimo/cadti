//ts-check
const { testApi } = require('./api')
const { procuracao: procuracaoMockData, procuracao2: procuracaoMockData2 } = require('./mockData/addProcuracaoMockData')
const { userMockData } = require('./mockData/addUserMockData')
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
    const procuradorIdsString = await testApi.post(`/api/procuradores`, { procuradores: addProcuradorMockData, codigoEmpresa })

    socioIds = JSON.parse(socioIdsString)
    procuradorIds = JSON.parse(procuradorIdsString)
    cpfSocios = addSociosMockData.map(s => s.cpf_socio)
    cpfProcuradores = addProcuradorMockData.map(p => p.cpf_procurador)
    cpfUsers = userMockData.map(u => u.cpf)
    users = []
    socios = []
    procuradores = []
    procuracao = null
    procuracao2 = null
    console.log("🚀 ~ file: ProcuracaoService.test.js:19 ~ beforeAll ~ Created IDs: ", { socioIds, procuradorIds })
});

describe('Procurações -> Testing ProcuracaoService', () => {
    describe('When a authorized user INSERTS a new procuracao', () => {
        it('should store the procuracao in DB', async () => {
            procuracaoMockData.procuradores = procuradorIds
            procuracaoId = await testApi.post(`/api/procuracoes`, procuracaoMockData)
            procuracao = await testApi.fetch(`/api/procuracoes?procuracao_id=${procuracaoId}`)
            console.log("🚀 ~ file: ProcuracaoService.test.js:25 ~ it ~ procuracao", procuracao)
            expect(procuracaoId).toBeTruthy()

            //Essa procuração é apenas para o teste adiante, no caso de um procurador que tem outra procuração vigente
            procuracaoMockData2.procuradores = [procuradorIds[1]]
            procuracaoId2 = await testApi.post(`/api/procuracoes`, procuracaoMockData2)
            expect(procuracaoId2).toBeTruthy()
        })

        it('should add codigoEmpresa to users and procuradores empresasArray if they are in procuracao', async () => {
            users = await testApi.fetch(`/api/users?cpf=${cpfUsers.join()}`)
            socios = await testApi.fetch(`/api/socios?cpf_socio=${cpfSocios.join()}`)
            procuradores = await testApi.fetch(`/api/procuradores?cpf_procurador=${cpfProcuradores.join()}`)

            expect(users.length).toBe(5)
            expect(socios.length).toBe(2)
            expect(procuradores.length).toBe(3)

            expect(users.slice(0, 4).every(user => user.empresas.includes(codigoEmpresa))).toBe(true)
            expect(socios.every(socio => socio.empresas.some(e => e.codigoEmpresa === codigoEmpresa))).toBe(true)
            expect(procuradores.every(user => user.empresas.includes(codigoEmpresa))).toBe(true)
        })

        it('should NOT add permission to users whose CPF is not in procuração', () => {
            expect(users[4].empresas.includes(codigoEmpresa)).toBe(false)
        });
    })

    describe('When a authorized user DELETES a procuracao', () => {
        it('should remove procuração from DB', async () => {
            await testApi.deleteOne(`/api/procuracoes?id=${procuracaoId}`)
            const procuracaoSearch = await testApi.fetch(`/api/procuracoes?procuracao_id=${procuracaoId}`)
            expect(procuracaoSearch.length).toBe(0)
        })

        it('should NOT remove empresa from USER empresasArray if user is ALSO socio', async () => {
            users = await testApi.fetch(`/api/users?cpf=${cpfUsers.join()}`)
            expect(users[0].empresas.includes(codigoEmpresa)).toBe(true)
            expect(users[1].empresas.includes(codigoEmpresa)).toBe(true)
        })

        it('should remove empresa from USER empresasArray if user is NOT socio', () => {
            expect(users[3].empresas.includes(codigoEmpresa)).toBe(false)
        })

        it('should NOT remove empresa from USER empresasArray if USER is NOT socio but HAS other procuracao', () => {
            expect(users[2].empresas.includes(codigoEmpresa)).toBe(true)
        })

        it('should NOT remove empresa from PROCURADOR empresasArray if PROCURADOR is NOT socio but HAS other procuracao', async () => {
            procuradores = await testApi.fetch(`/api/procuradores?cpf_procurador=${cpfProcuradores.join()}`)
            const procuradorWithOtherProcuracao = procuradores[1]
            expect(procuradorWithOtherProcuracao.empresas.includes(codigoEmpresa)).toBe(true)
        })

        it('should remove empresa from PROCURADORES empresasArray if NOT socios NOR have other procuracao ', async () => {
            const procuradoresToRemoveEmpresa = [procuradores[0], procuradores[2]]
            expect(procuradoresToRemoveEmpresa.every(procurador => procurador.empresas.includes(codigoEmpresa))).toBe(false)
            console.log("🚀 ~ file: ProcuracaoService.test.js:92 ~ it ~ true", procuradores)
        })
    })
})

afterAll(() => {
    for (const user of users) {
        testApi.deleteOne(`/api/users?id=${user._id}`)
    }

    for (const id of socioIds) {
        testApi.deleteOne(`/api/socios?id=${id}&codigoEmpresa=${codigoEmpresa}`)
    }

    for (const id of procuradorIds) {
        testApi.deleteOne(`/api/procuradores?id=${id}&codigoEmpresa=${codigoEmpresa}`)
    }

    testApi.deleteOne(`/api/procuracoes?id=${procuracaoId2}`)

    console.log(`🚀 ~file: addProcuradorPermissions.test.js: 57 - DB CleanUp: ${procuracaoId}, ${procuracaoId2} DELETED.`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - DB CleanUp: ${socioIds} DELETED.`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - DB CleanUp: ${procuradorIds} DELETED.`)
    console.log(`🚀 ~ file: addProcuradorPermissions.test.js:58 - MongoDB CleanUp (users): ${users.map(({ _id }) => _id)} DELETED.`)
})