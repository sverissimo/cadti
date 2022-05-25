const { exec } = require('child_process')
const dotenv = require('dotenv')

const runDbSync = () => {

    const pathToFile = process.env.DB_SYNC_PATH
    console.log({ pathToFile })

    exec(`python ${pathToFile} veiculos`, (err, stdout, stdin) => {
        if (err)
            console.log({ err })
        console.log({ stdout, stdin })
    })
    return
}

//Development / tests - só roda se for manualmente passado algum argumento na CLI node runAlerts.js
if (process.argv[2]) {
    const d = new Date()
    console.log(`*************************DB_Sync SGTI/CadTI started at ${d}`)
    console.log('Running DB_SYNC tests, should be in development /tests environment. Arg passed: ', process.argv[2])

    if (!process.env.DB_SYNC_PATH)
        dotenv.config({ path: '../../.env' })
    runDbSync()
    //setTimeout(() => { process.exit() }, 15000);
}


module.exports = runDbSync