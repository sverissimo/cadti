/* const { pool } = require('../config/pgConfig')
const { createDBQuery } = require('./createDbQuery')
 */
//@ts-check
const
    { execSync, exec } = require('child_process')
    , fs = require('fs')
    , date = new Date()
    , day = date.getDate()
    , month = date.toLocaleDateString('en-US', { month: 'short' })
    , year = date.getFullYear()
    , dotenv = require('dotenv')

if (!process.env.DB_USER)
    dotenv.config({ path: '../../.env' })

const { DB_USER, DB_PASS, CREATE_DB_PATH, DB_BACKUP_PATH, FILE_SECRET } = process.env


class BackupDB {
    constructor() {
        this.fullDate = day + month + year
        this.fileName = `backup_PG_${this.fullDate}.sql`
        this.safetyName = `safetyBackup_${this.fullDate}.sql`
        this.path = DB_BACKUP_PATH
    }
    async createDB() {
        const c = execSync(`psql --host=localhost --port=5432 --dbname=sismob_db --username=${DB_USER} --password=${DB_PASS} --file=${CREATE_DB_PATH}`)
        console.log("🚀 ~ file: BackupDB.js ~ line 26 ~ BackupDB ~ createDB ~ result", c)
    }

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
        const { path, safetyName } = this
            //, restoreDBQuery = execSync(`pg_restore "host=localhost port=5432 dbname=sismob_db user=postgres password=${FILE_SECRET}" > ${path + safetyName}`, { encoding: 'utf-8' })
            , restoreDBQuery = `psql --host=localhost --port=5432 --dbname=sismob_db --username=${DB_USER} --password=${DB_PASS} --file=${path + safetyName}`

        exec(restoreDBQuery, (err, stdout, stderr) => {
            console.log({ err, stdout, stderr })
        })
    }
}
if (process.argv[2] && process.argv[2] === 'restore') {

    console.log('Alright, restoring Postgresql DB now...')
    const backupManager = new BackupDB()

    backupManager.createSafetyBackup()
    backupManager.createNewBackup()
    backupManager.restoreDB()
}

module.exports = { BackupDB }

/* const a = new BackupDB()
console.log(a) */
//a.createDB()
//a.createSafetyBackup()
//a.createNewBackup()
//a.restoreDB()