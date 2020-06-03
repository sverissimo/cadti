const { logsModel } = require('./mongo/models/logsModel')

const logHandler = (req, res, next) => {
    const
        { log } = req.body,
        logObject = new logsModel(log)

    console.log(log, logObject)

    logObject.save(function (err, doc) {
        if (err) console.log(err)
        if (doc) res.json(doc)
    });

}

module.exports = { logHandler }