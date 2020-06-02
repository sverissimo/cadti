const { logsModel } = require('./mongo/models/logs')

const logGenerator = (req, res, next) => {
    const
        { log } = req.body,
        logObject = new logsModel(log)

    console.log(log, logObject)

    logObject.save(function (err, doc) {
        if (err) {
            console.log(err)
            res.send(err)
            return
        }
        res.json(doc)
    });

}

module.exports = { logGenerator }


