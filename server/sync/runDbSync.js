const { exec } = require('child_process')

const runDbSync = () => {

    const pathToFile = process.env.DB_SYNC_PATH
    console.log({ pathToFile })

    exec(`python ${pathToFile} veiculos local`, (err, stdout, stdin) => {
        if (err)
            console.log({ err })
        console.log({ stdout, stdin })
    })
    return
}

module.exports = runDbSync