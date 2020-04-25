const fs = require('fs')
const path = require('path')
const formidable = require('formidable')

const { encrypt, decrypt } = require('./fileHandler')

const uploadFS = (req, res) => {

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

module.exports = { uploadFS }


//*************************************FILESYSTEM UPLOAD AND DOWNLOAD REQUESTS*****************************************
/* 
app.post('/api/upload', uploadFS)

app.get('/api/download', (req, res) => {
    const fPath = path.join(__dirname, '../files', 'a.txt')
    res.set({
        'Content-Type': 'text',
        'Content-Disposition': 'attachment'
    });

    const pathZ = path.resolve(__dirname, '../files', 'delegas.xls')
    const stream = fs.createReadStream(fPath, { autoClose: true }) 
    stream.on('close', () => res.end())
    stream.pipe(res)
    res.download(fPath)
}) */