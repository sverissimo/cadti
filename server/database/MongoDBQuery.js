//@ts-check
const { exec } = require('child_process')
const dotenv = require('dotenv')
class MongoDBQuery {

    /**@property backupScriptPath {string} - path absoluto para os scripts de backup*/
    backupScriptPath

    constructor() {

        if (!process.env.POSTGRES_BACKUP_SCRIPT_PATH)
            dotenv.config({ path: '../../.env' })

        this.backupScriptPath = process.env.POSTGRES_BACKUP_SCRIPT_PATH
    }


    backup() {
        exec(`bash ${this.backupScriptPath}mongoBackup.sh`, (err, stdout, sterr) => {
            console.log("🚀 ~ file: MongoDBQuery.js ~ line 7 ~ backup() ~ exec ~ {err, stdout, sterr}", { err, stdout, sterr })
        })
    }

    /**
     * @param restoreDate {string} - string no formato dd-mm-yyyy, que corresponde à pasta gerada automaticamente pelo método backup da classe MongoDBQuery      
     * */
    restore(restoreDate) {
        console.log(`bash mongoRestore.sh ${restoreDate}`)
        exec(`bash ./scripts/mongoRestore.sh ${restoreDate}`, (err, stdout, sterr) => {
            console.log("🚀 ~ file: MongoDBQuery.js ~ line 15 ~ MongoDBQuery ~ exec ~ {err, stdout, sterr}", { err, stdout, sterr })
        })

    }
}

module.exports = MongoDBQuery