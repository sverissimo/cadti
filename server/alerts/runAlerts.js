const main = require(".");

function runAlerts() {
       const d = new Date()
       console.log(`###########################Alerts about seguros, procs and laudos started running at ${d}`)
       main('seguros')

       setTimeout(() => {
              main('laudos')
       }, 15000)

       setTimeout(() => {
              main('procuracoes')
       }, 15000)
}

//Development / tests - só roda se for manualmente passado algum argumento na CLI node runAlerts.js
if (process.argv[2]) {
       console.log('Running alert tests, should be in development environment. Arg passed: ', process.argv[2])
       runAlerts()
       //setTimeout(() => { process.exit() }, 15000);
}

module.exports = runAlerts