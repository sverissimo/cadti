const fs = require('fs')

const fileBackup = (req, fields) => {
    console.log("🚀 ~ file: fileBackup.js ~ line 4 ~ fileBackup ~ fields", fields)
    const
        backupSocket = req.app.get('backupSocket'),
        filesToBackup = req.app.get('filesToBackup')
        , filesToSend = filesToBackup.toString('base64')
    //  , name = fields[0].filename
    //fs.writeFileSync('name.docx', filesToBackup)

    backupSocket.emit('a', { files: filesToSend, fields })
    //console.log("🚀 ~ file: fileBackup.js ~ line 7 ~ fileBackup ~ file", filesToBackup)
    //next()
}

module.exports = fileBackup
/*
const
            file = Object.values(files)[0]
        const f = fs.readFile(file.path, (err, data) => {
            if (err)
                console.log(err)
            fs.writeFileSync('tst.docx', data)
        })

        return res.send('ok') */