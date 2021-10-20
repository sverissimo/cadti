const main = require(".");

function runAlerts() {
     main('seguros')
    //main('laudos') 
    //main('procuracoes')
    /*    setTimeout(() => {
           process.exit()
       }, 30000); */
}

//Development / tests
runAlerts()

module.exports = runAlerts