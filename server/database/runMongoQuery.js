const MongoDBQuery = require("./MongoDBQuery")

const
    { argv } = process
    , command = argv[2]

//Função que pode ser rodada na CLI, caso sejam passados args ou mediante call interno do servidor.
const runMongoQuery = (serverCommand) => {
    const mongoQuery = new MongoDBQuery()

    if (command === 'backup' || serverCommand === 'backup')
        mongoQuery.backup()

    //Ex: node runMongoQuery.js restore 16-11-2021
    if (command === 'restore' || serverCommand === 'restore') {

        const restoreDate = argv[3]
        mongoQuery.restore(restoreDate)
    }
}

if (argv && argv.length)
    runMongoQuery()

module.exports = runMongoQuery