const { vehicleLogsModel } = require('./mongo/models/vehicleLogsModel')

const logHandler = async (req, res, next) => {
    /* console.dir(vehicleLogsModel)
    vehicleLogsModel.counterReset('logs_counter', err => {
        if (err) console.log(err)
    }) */

    const
        { log, collection, } = req.body,
        { id, subject, history, status, completed } = log,
        logsModel = { vehicleLogs: vehicleLogsModel }

    const
        logObject = new logsModel[collection](log),
        model = logsModel[collection]

    if (!id) {
        logObject.save(function (err, doc) {
            if (err) console.log(err)
            if (doc) res.locals = { doc }
            next()
        })
    }
    else {
        let updatedObject = { status, subject, completed: completed || false }
        if (!subject) delete updatedObject.subject

        res.locals.id = id
        res.locals.doc = await model.findOneAndUpdate(
            { '_id': id },
            {
                $push: { 'history': history },
                $set: { ...updatedObject }
            },
            { new: true }
        )
        next()
    }
}

module.exports = { logHandler }