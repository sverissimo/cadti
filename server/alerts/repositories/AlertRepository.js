//@ts-check
const
    alertModel = require("../../mongo/models/alertModel")
    , { conn } = require("../../mongo/mongoConfig")

class AlertRepository {

    //Construtor para testes em ambiente de produção apenas
    constructor() {
        if (!process.env.DB && process.env.NODE_ENV !== 'production') {
            conn.on('error', console.error.bind(console, 'connection error:'))
            conn.once('open', () => {
                console.log('Testing alert... Mongo connected to the server.')
            })
        }
    }

    save({ codigo_empresa, subject, vocativo, message }) {
        const
            alertObject = { codigo_empresa, subject, vocativo, message }
            , alertDoc = new alertModel(alertObject)

        alertDoc.save((err, doc) => {
            if (err)
                console.log(err)
            else
                console.log(doc)
        })
    }
}

module.exports = AlertRepository