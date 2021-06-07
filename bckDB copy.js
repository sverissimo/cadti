const
    { execSync } = require('child_process')
    , fs = require('fs')

const
    a = execSync('echo fk... done.', { encoding: 'utf-8' })
    , date = new Date()
    , day = date.getDate()
    , month = date.toLocaleDateString('default', { month: 'short' })
    , year = date.getFullYear()
    , fullDate = day + month + year
    , fileName = `backup_PG_${fullDate}.SQL`
    , safetyName = `safetyBackup_${fileName}`
    , path = 'C:\\Users\\sandr\\OneDrive\\Seinfra\\Coding\\DB_BAC~1\\'

const safetyBackup = fs.existsSync(path + safetyName)

if (!safetyBackup)
    execSync(`pg_dump "host=localhost port=5432 dbname=sismob_db user=postgres password=mengo" > ${path + safetyName}`)

console.log(fileName)





console.log(a)


