const
    { mongo } = require('mongoose'),
    { filesModel } = require('./models/filesModel'),
    { empresaModel } = require('./models/empresaModel'),
    { getUpdatedData } = require('../getUpdatedData'),
    { pool } = require('../config/pgConfig')

const mongoDownload = (req, res, gfs) => {

    const fileId = new mongo.ObjectId(req.query.id)
    const collection = req.query.collection

    gfs.collection(collection)
    gfs.files.findOne({ _id: fileId }, (err, file) => {

        if (!file)
            return res.status(404).json({ responseMessage: err })

        else {
            const readstream = gfs.createReadStream({ filename: file.filename })

            res.set({
                'Content-Type': file.contentType,
                'Content-Disposition': 'attachment',
            })
            return readstream.pipe(res)
        }
    })
}

const getFilesMetadata = async (req, res) => {

    let
        filesCollection,
        fieldName = {},
        filter = {}
    const
        { user } = req,
        empresas = user && user.empresas,
        role = user && user.role,
        condition = role === 'empresa' && `WHERE empresas.codigo_empresa IN (${empresas})` || '',

        //Query para obter todas as placas de veículos de uma determinada empresa
        query = `SELECT empresas.codigo_empresa,
            array_remove(array_agg(v.veiculo_id), null) frota			
            FROM public.empresas
            LEFT JOIN veiculos v
                ON v.codigo_empresa = empresas.codigo_empresa
            ${condition}
            GROUP BY empresas.codigo_empresa
            ORDER BY frota DESC`

    const
        request = await pool.query(query),
        result = request && request.rows

    if (req.params.collection === 'vehicleDocs') filesCollection = filesModel
    if (req.params.collection === 'empresaDocs') filesCollection = empresaModel
    if (req.query.fieldName)
        fieldName = { 'metadata.fieldName': req.query.fieldName }

    //Filtro de permissão de usuários 
    if (role !== 'admin' && empresas[0]) {
        if (req.params.collection === 'empresaDocs')
            filter = { 'metadata.empresaId': { $in: empresas } }
        else {
            const frota = result[0] && result[0].frota
            filter = { 'metadata.veiculoId': { $in: frota } }
        }
    }

    filesCollection.find({ ...filter, ...fieldName }).sort({ uploadDate: -1 }).exec((err, doc) => res.send(doc))
}



const getOneFileMetadata = (req, res) => {

    const { collection, id } = req.query

    let filesCollection = empresaModel
    if (collection === 'vehicleDocs') filesCollection = filesModel

    filesCollection.find({ 'metadata.procuracaoId': id.toString() }).exec((err, doc) => res.send(doc))
}

module.exports = { mongoDownload, getFilesMetadata, getOneFileMetadata }