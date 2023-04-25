//const fs = require('fs')
const { getUpdatedData } = require("../infrastructure/SQLqueries/getUpdatedData")

const fileBackup = async (binaryFiles, fields, backupSocket) => {
    const filesToSend = []
    const addMetadata = {}

    if (!backupSocket) //cancela o backup se não houver socket definido
        return

    //adiciona metadata para o backup
    if (fields.length) {
        const { metadata } = fields[0]
        const { empresaId, veiculoId } = metadata

        if (empresaId) {
            const condition = `WHERE empresas.codigo_empresa = ${empresaId}`
            const request = await getUpdatedData('empresas', condition)
            const empresa = request[0]
            const { razao_social } = empresa
            Object.assign(addMetadata, { empresaId, razaoSocial: razao_social })
        }
        if (veiculoId) {
            const condition = `WHERE veiculos.veiculo_id = ${veiculoId}`
            const request = await getUpdatedData('veiculos', condition)
            const veiculo = request[0]
            const { codigo_empresa: empresaId, empresa: razaoSocial, placa } = veiculo
            Object.assign(addMetadata, { empresaId, razaoSocial, placa })
        }
    }

    //Cria uma array de files em formato de string bas464
    for (const file of binaryFiles) {
        const fileString64 = file.toString('base64')
        filesToSend.push(fileString64)
    }
    return { files: filesToSend, fields }
    backupSocket.emit('fileBackup', { files: filesToSend, fields })

    /*
    Testing multiple files
    let k = 0
    for (let f of filesToSend) {
        const
            fName = fields[k].filename
            , f2 = Buffer.from(f, 'base64')
        fs.writeFileSync(fName, f2)
    } */

    /*
    Testing single files
    name = fields[0].filename
    fs.writeFileSync('name.docx', filesToBackup)
     */
    //console.log("🚀 ~ file: fileBackup.js ~ line 7 ~ fileBackup ~ file", filesToBackup)
}

module.exports = fileBackup
