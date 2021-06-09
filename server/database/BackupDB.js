/* const { pool } = require('../config/pgConfig')
const { createDBQuery } = require('./createDbQuery')
 */
//@ts-check
const
    { execSync } = require('child_process')
    , fs = require('fs')
    , date = new Date()
    , day = date.getDate()
    , month = date.toLocaleDateString('en-US', { month: 'short' })
    , year = date.getFullYear()
    , dotenv = require('dotenv')

if (!process.env.DB_USER)
    dotenv.config({ path: '../../.env' })

const { DB_USER, DB_PASS, CREATE_DB_PATH, DB_BACKUP_PATH } = process.env


class BackupDB {
    constructor() {
        this.fullDate = day + month + year
        this.fileName = `backup_PG_${this.fullDate}.sql`
        this.safetyName = `safetyBackup_${this.fullDate}.sql`
        this.path = DB_BACKUP_PATH
    }
    /*  async createDB() {
         const c = execSync(`psql --host=localhost --port=5432 --dbname=sismob_db --username=${DB_USER} --password=${DB_PASS} --file=${CREATE_DB_PATH}`)
         console.log("🚀 ~ file: BackupDB.js ~ line 26 ~ BackupDB ~ createDB ~ result", c)
     }
  */
    createSafetyBackup() {
        const
            { path, safetyName } = this
            , safetyBackup = fs.existsSync(path + safetyName)

        if (!safetyBackup)
            execSync(`pg_dump "host=localhost port=5432 dbname=sismob_db user=${DB_USER} password=${DB_PASS}" > ${path + safetyName}`)
        console.log(`Created safety backup: ${safetyName}`)
    }

    createNewBackup() {
        const { path, fileName } = this
        execSync(`pg_dump "host=localhost port=5432 dbname=sismob_db user=${DB_USER} password=${DB_PASS}" > ${path + fileName}`)
        //console.log("🚀 ~ file: BackupDB.js ~ line 39 ~ BackupDB ~ createNewBackup ~ fileName", { fileName, DB_USER, DB_PASS, DB_BACKUP_PATH })
    }

    restoreDB() {
        const { path, fileName } = this
            //, b = execSync(`pg_restore "host=localhost port=5432 dbname=sismob_db user=postgres password=${FILE_SECRET}" > ${path + fileName}`, { encoding: 'utf-8' })
            , restoreDBQuery = `psql --host=localhost --port=5432 --dbname=sismob_db --username=${DB_USER} --password=${DB_PASS} --file=${path + fileName}`
            , runRestore = execSync(restoreDBQuery)

        console.log("🚀 ~ file: BackupDB.js ~ line 46 ~ BackupDB ~ restoreDB ~ restoreDBQuery", restoreDBQuery)
        console.log(runRestore)
    }
}


module.exports = { BackupDB }

/* const a = new BackupDB()
console.log(a) */
//a.createDB()
//a.createSafetyBackup()
//a.createNewBackup()
//a.restoreDB()