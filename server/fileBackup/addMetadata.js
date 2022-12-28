//@ts-check
const { getUpdatedData } = require("../infrastructure/SQLqueries/getUpdatedData")


//adiciona metadata para o backup
const addMetadata = async (/** @type {{ empresaId: any; veiculoId: any; }} */ metadata) => {

    if (metadata) {
        const { empresaId, veiculoId } = metadata
        let
            razaoSocial
            , placa
            , codigoEmpresa
        if (empresaId) {
            const
                condition = `WHERE empresas.codigo_empresa = ${empresaId}`
                , request = await getUpdatedData('empresas', condition)
                , empresa = request[0]
                , { razao_social, codigo_empresa } = empresa

            razaoSocial = razao_social
            codigoEmpresa = codigo_empresa
        }
        if (veiculoId) {
            const
                condition = `WHERE veiculos.veiculo_id = ${veiculoId}`
                , request = await getUpdatedData('veiculos', condition)
                , veiculo = request[0]
                , { codigo_empresa: empresaId, empresa: razao_social, placa: vPlaca } = veiculo

            razaoSocial = razao_social
            codigoEmpresa = empresaId
            placa = vPlaca
        }
        return { razaoSocial, placa, codigoEmpresa }
    }
}

module.exports = { addMetadata }