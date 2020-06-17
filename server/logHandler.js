const { vehicleLogsModel } = require('./mongo/models/vehicleLogsModel')

const logHandler = (req, res, next) => {
    const
        { log, collection, } = req.body,
        { id, history, status, completed } = log,
        logsModel = { vehicleLogs: vehicleLogsModel },

        logObject = new logsModel[collection](log)


    if (!id) {
        logObject.save(function (err, doc) {
            if (err) console.log(err)
            if (doc) res.json({ doc, log })
        })
    }
    else {
        logsModel[collection].updateOne(
            { '_id': id },
            {
                $push: { 'history': history },
                $set: { 'status': status, completed: completed || false }
            }).then(result => res.json(result))
    }

    /* logObject.save(function (err, doc) {
        if (err) console.log(err)
        if (doc) res.json(doc)
    }); */

}

module.exports = { logHandler }