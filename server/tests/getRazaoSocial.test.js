//ts-check
const FileController = require('../controllers/FileController')

process.env.NODE_ENV = 'test'

describe('FileService -> Testing getRazaoSocial method', () => {
    it('Given a metadata with empresaID, should return the razaoSocial', async () => {

        const metadata = {
            empresaId: 9060,
            tempFile: false,
            fieldName: "altContratoDoc",
            socios: [3, 4],
            numeroAlteracao: "22"
        }
        const razaoSocial = await new FileController()._getRazaoSocial(metadata)
        expect(razaoSocial).toBe('EMPRESA GONTIJO DE TRANSPORTES LIMITADA')
    })

    it('Given a metadata with veiculoID, should return the razaoSocial', async () => {

        const metadata = {
            fieldName: "laudoDoc",
            veiculoId: 65,
            tempFile: false,
            laudoId: "5555"
        }
        const razaoSocial = await new FileController()._getRazaoSocial(metadata)
        expect(razaoSocial).toBe('SARITUR - SANTA RITA TRANSPORTE URBANO E RODOVIARIO LTDA')
    })
})
