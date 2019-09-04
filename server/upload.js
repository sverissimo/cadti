const fs = require('fs')
const path = require('path')
const formidable = require('formidable')

const { encrypt, decrypt } = require('./fileHandler')

const upload = (req, res) => {

    const pass = encrypt('Bruno Henrique.Whsx')
    const realPass = decrypt(pass)
    const craque = [pass, realPass]
    
    const parsedForm = new formidable.IncomingForm().parse(req)
    parsedForm.on('field', (name, field) => {
        console.log('Field', name, field)
    })

    parsedForm.on('file', function (name, file) {
        console.log('ARQUIVOS-------------------', name)
        const newPath = path.resolve(__dirname, '../files', file.name)
        fs.rename(file.path, newPath, err => console.log(err))
    })

    parsedForm.on('error', (err) => {
        console.error('Error', err)
        throw err
    })
    parsedForm.on('end', () => {
        res.send(craque)
    })

    /* , (err, fields, files) => {
        if (err) console.log(err)
        console.log(fields, files)
        res.send(files)
        return */
}

module.exports = { upload }