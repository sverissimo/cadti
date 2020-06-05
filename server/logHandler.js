const { logsModel } = require('./mongo/models/logsModel')
const { vehicleLogsModel } = require('./mongo/models/vehicleLogsModel')

const logHandler = (req, res, next) => {
    const
        { log, collection, id } = req.body,
        logsModel = { vehicleLogs: vehicleLogsModel },

        logObject = new logsModel[collection](log)

    console.log(log, logObject)
    if (!id) {
        logObject.save(function (err, doc) {
            if (err) console.log(err)
            if (doc) res.json({doc, log})
        })
    }


    else {
        logModelSelector[collection].updateOne(
            { '_id': req.body.item._id },
            {
                $push: { 'processHistory': req.body.processHistory },
                $set: req.body.item
            }).then(result => res.json(result))
    }

    /* logObject.save(function (err, doc) {
        if (err) console.log(err)
        if (doc) res.json(doc)
    }); */

}

module.exports = { logHandler }