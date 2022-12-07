const
    { mongo } = require('mongoose'),
    { filesModel } = require('./models/filesModel'),
    { empresaModel } = require('./models/empresaModel'),
    { pool } = require('../config/pgConfig')

const mongoDownload = (req, res, gfs) => {

    const fileId = new mongo.ObjectId(req.query.id)
    const collection = req.query.collection

    gfs.collection(collection)
    gfs.files.findOne({ _id: fileId }, (err, file) => {

        if (!file)
            return res.status(404).json({ responseMessage: err })

        else {
            const readStream = gfs.createReadStream({ filename: file.filename })

            res.set({
                'Content-Type': file.contentType,
                'Content-Disposition': 'attachment',
            })
            return readStream.pipe(res)
        }
    })
}

const getFilesMetadata = async ({ user, collection, fieldName = '' }) => {
    const { empresas, role } = user
    const condition = role === 'empresa' ? `WHERE empresas.codigo_empresa IN (${empresas})` : ''
    let filesCollectionModel
    let filter = {}
    let fieldObject = {}

    if (collection === 'vehicleDocs') filesCollectionModel = filesModel
    if (collection === 'empresaDocs') filesCollectionModel = empresaModel
    if (fieldName) {
        fieldObject = { 'metadata.fieldName': fieldName }
    }
    //Filtro de permissão de usuários 
    if (role === 'empresa' && empresas[0]) {
        if (collection === 'empresaDocs')
            filter = { 'metadata.empresaId': { $in: empresas } }
        else {
            //Query para obter todas as placas de veículos de uma determinada empresa
            const query = `SELECT empresas.codigo_empresa,
                            array_remove(array_agg(v.veiculo_id), null) frota			
                            FROM public.empresas
                            LEFT JOIN veiculos v
                                ON v.codigo_empresa = empresas.codigo_empresa
                            ${condition}
                            GROUP BY empresas.codigo_empresa
                            ORDER BY frota DESC`

            const request = await pool.query(query)
            const result = request && request.rows
            const frota = result[0] && result[0].frota ? result[0].frota : []
            filter = { 'metadata.veiculoId': { $in: frota } }
        }
    }
    const files = await filesCollectionModel.find({ ...filter, ...fieldObject }).sort({ uploadDate: -1 })
    return files
}

const getOneFileMetadata = async (req, res) => {

    const
        { collection, md5 } = req.query
        , filter = { md5 }

    let filesCollection = empresaModel
    if (collection === 'vehicleDocs') filesCollection = filesModel

    filesCollection.findOne(filter, (err, doc) => {
        if (err)
            console.log(err)
        res.send(doc)
    })
    //filesCollection.find(filter).exec((err, doc) => res.send(doc))
}

module.exports = { mongoDownload, getFilesMetadata, getOneFileMetadata }