const main = require(".");

main('seguros')
main('procuracoes')
main('laudos')

setTimeout(() => {
    process.exit()
}, 10000);
