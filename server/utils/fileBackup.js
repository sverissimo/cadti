const fileBackup = (req, fields) => {

    const
        backupSocket = req.app.get('backupSocket'),
        filesToBackup = req.app.get('filesToBackup')

    backupSocket.emit('a', { files: filesToBackup, fields })
    //console.log("🚀 ~ file: fileBackup.js ~ line 7 ~ fileBackup ~ file", filesToBackup)
    //next()
}

module.exports = fileBackup
