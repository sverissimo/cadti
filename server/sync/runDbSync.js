const { exec } = require('child_process')

const runDbSync = () => {
    exec('python C:\\DB_sync\\app\\app.py veiculos local', (err, stdout, stdin) => {
        if (err)
            console.log({ err })
        console.log({ stdout, stdin })
    })
    return
}

module.exports = runDbSync