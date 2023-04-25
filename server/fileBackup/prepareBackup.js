//@ts-check
const formidable = require('formidable')
const fs = require('fs');

const prepareBackup = async (req, res, next) => {
    const form = formidable({ multiples: true });
    const { files, filesMetadata } = await new Promise((resolve, reject) => {
        const binaryFiles = []
        form.parse(req, (err, fields, files) => {
            console.log("🚀 ~ file: prepareBackup.js:10 ~ form.parse ~ fields:", fields)
            if (err) {
                reject(err)
            }

            for (const f in files) {
                const file = files[f]
                const fBinary = fs.readFileSync(file.path)
                binaryFiles.push(fBinary)
            }
            resolve({ files: binaryFiles, filesMetadata: fields })
        })
    })
    res.locals.binaryFiles = files
    res.locals.filesMetadata = filesMetadata
    next()
}

module.exports = prepareBackup
