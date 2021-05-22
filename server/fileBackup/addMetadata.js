//@ts-check
const { getUpdatedData } = require("../getUpdatedData")


//adiciona metadata para o backup
const addMetadata = async (metadata) => {

    if (metadata) {
        const { empresaId, veiculoId } = metadata
        let razaoSocial, placa
        if (empresaId) {
            const
                condition = `WHERE empresas.codigo_empresa = ${empresaId}`
                , request = await getUpdatedData('empresas', condition)
                , empresa = request[0]
                , { razao_social } = empresa
            console.log("🚀 ~ file: addMetadata.js ~ line 17 ~ addMetadata ~ empresa", empresa)
            //    Object.assign(addMetadata, { empresaId, razaoSocial: razao_social })
            razaoSocial = razao_social
        }
        if (veiculoId) {
            const
                condition = `WHERE veiculos.veiculo_id = ${veiculoId}`
                , request = await getUpdatedData('veiculos', condition)
                , veiculo = request[0]
                , { codigo_empresa: empresaId, empresa: razaoSocial, placa: vPlaca } = veiculo
            //Object.assign(addMetadata, { empresaId, razaoSocial, placa })
            placa = vPlaca
        }
        return { razaoSocial, placa }
    }
}

module.exports = { addMetadata }