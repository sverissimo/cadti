//const fs = require('fs')

const { getUpdatedData } = require("../getUpdatedData")


const fileBackup = async (req, fields) => {
    const
        backupSocket = req.app.get('backupSocket')
        //, filesToBackup = req.app.get('filesToBackup')
        , binaryFiles = req.app.get('binaryFiles')
        , filesToSend = []
        , addMetadata = {}

    if (!backupSocket) //cancela o backup se não houver socket definido
        return

    //adiciona metadata para o backup
    if (fields.length) {
        const
            { metadata } = fields[0]
            , { empresaId, veiculoId } = metadata
        console.log("🚀 ~ file: fileBackup.js ~ line 19 ~ fileBackup ~ metadata", metadata)

        if (empresaId) {
            const
                condition = `WHERE empresas.codigo_empresa = ${empresaId}`
                , request = await getUpdatedData('empresas', condition)
                , empresa = request[0]
                , { razao_social } = empresa
            Object.assign(addMetadata, { empresaId, razaoSocial: razao_social })
        }
        if (veiculoId) {
            const
                condition = `WHERE veiculos.veiculo_id = ${veiculoId}`
                , request = await getUpdatedData('veiculos', condition)
                , veiculo = request[0]
                , { codigo_empresa: empresaId, empresa: razaoSocial, placa } = veiculo
            Object.assign(addMetadata, { empresaId, razaoSocial, placa })
        }
    }


    //Cria uma array de files em formato de string bas464
    let i = 0
    for (let file of binaryFiles) {
        const fileString64 = file.toString('base64')
        filesToSend.push(fileString64)
        console.log(typeof fields[i] === 'object')
        typeof fields[i] === 'object' && fields[i].metadata && Object.assign(fields[i].metadata, addMetadata)
        console.log("🚀 ~ file: fileBackup.js ~ line 44 ~ fileBackup ~ addMetadata", addMetadata)
        console.log("🚀 ~ file: fileBackup.js ~ line 45 ~ fileBackup ~ fields[i]", fields[i])
        i++
    }

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
