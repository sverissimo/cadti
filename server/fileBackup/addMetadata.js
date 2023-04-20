//@ts-check
const { getUpdatedData } = require("../infrastructure/SQLqueries/getUpdatedData")

const addMetadata = async (/** @type {{ empresaId: any; veiculoId: any; }} */ metadata) => {
    const { empresaId, veiculoId } = metadata
    let razaoSocial
    let placa
    let codigoEmpresa

    if (empresaId) {
        const condition = `WHERE empresas.codigo_empresa = ${empresaId}`
        const request = await getUpdatedData('empresas', condition)
        const empresa = request[0]
        const { razao_social, codigo_empresa } = empresa

        razaoSocial = razao_social
        codigoEmpresa = codigo_empresa
    }

    if (veiculoId) {
        const condition = `WHERE veiculos.veiculo_id = ${veiculoId}`
        const request = await getUpdatedData('veiculos', condition)
        const veiculo = request[0]
        const { codigo_empresa: empresaId, empresa: razao_social, placa: vPlaca } = veiculo

        razaoSocial = razao_social
        codigoEmpresa = empresaId
        placa = vPlaca
    }

    return { razaoSocial, placa, codigoEmpresa }
    //return { razaoSocial }
}

module.exports = { addMetadata }
