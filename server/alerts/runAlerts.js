const main = require(".");

function runAlerts() {
    main('seguros')
    main('procuracoes')
    main('laudos')
    /*    setTimeout(() => {
           process.exit()
       }, 30000); */
}

//Development / tests
runAlerts()

module.exports = runAlerts