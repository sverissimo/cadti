const
    express = require('express'),
    router = express.Router(),
    parametrosModel = require('../mongo/models/parametrosModel/parametrosModel')

router.get('/', async (req, res) => {

    const data = await parametrosModel.find()

    //Se não tiver nada no MongoDB, populate com valores padrão dos respectivos mongooseSchemas na pasta models/parametros
    if (!data[0]) {
        console.log('needed to populate')
        const initiateDB = new parametrosModel({})
        initiateDB.save((err, doc) => {
            if (err) console.log(err)
            console.log(doc)
            res.send([doc])
        })
    }
    else {
        console.log('NOOO needed to populate!@!!!!!!!!!!!')
        res.send(data)
    }
})

router.put('/', async (req, res) => {

    const
        update = req.body,
        query = {},
        options = {
            new: true,
            upsert: true,
            omitUndefined: true
        },
        io = req.app.get('io')
    console.log(io)
    let
        socketEvent = 'insertElements',
        socketProp = 'insertedObjects',
        preventSocket

    //Checa se já existe
    if (update.id) {
        query._id = update.id
        socketEvent = 'updateAny'
        socketProp = 'updatedObjects'
        //Apaga o campo id do update, senão não mexe no ID
        delete update.id
    }
    if (update.preventSocket) {
        preventSocket = true
        console.log("preventSocket", preventSocket)
    }
    delete update.preventSocket

    parametrosModel.findOneAndUpdate(query, update, options, (err, doc) => {
        if (err) console.log(err)
        doc.id = doc._id
        delete doc._id
        console.log("doc", doc)
        if (!preventSocket) {
            console.log("shouldnt have preventsocekt", preventSocket)
            io.sockets.emit(socketEvent, { [socketProp]: [doc], collection: 'parametros', primaryKey: 'id' })
        }
        res.send([doc])
    })
})

module.exports = router