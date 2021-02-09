const logsModel = require('./mongo/models/logsModel')


const logHandler = async (req, res, next) => {

    const
        { log } = req.body,
        { id, subject, history, status, completed } = log,
        logObject = new logsModel(log)
    console.log("🚀 ~ file: logHandler.js ~ line 10 ~ logHandler ~ log", log)

    if (!id) {
        logObject.save(function (err, doc) {
            if (err) console.log(err)
            if (doc) res.locals = { doc }
            //console.log("🚀 ~ file: logHandler.js ~ line 16 ~ doc", doc)
            next()
        })
    }
    else {
        let updatedObject = { status, subject, completed: completed || false }
        if (!subject) delete updatedObject.subject

        res.locals.id = id
        res.locals.doc = await logsModel.findOneAndUpdate(
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