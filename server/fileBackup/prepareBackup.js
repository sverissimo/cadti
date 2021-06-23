const
    formidable = require('formidable')
    , fs = require('fs')


const prepareBackup = (req, res, next) => {
    const form = formidable({ multiples: true });
    let binaryFiles = []
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return
        }
        for (let f in files) {
            let
                file = files[f]
                , fBinary = fs.readFileSync(file.path)

            console.log("🚀 ~ file: server.js ~ line 154 ~ form.parse ~ file", file.name)
            binaryFiles.push(fBinary)
        }
        req.app.set('binaryFiles', binaryFiles)
    })
    next()
}

module.exports = prepareBackup