const createDBQuery = user => {
    return `
    SELECT
        pg_terminate_backend (pid)
    FROM
        pg_stat_activity
    WHERE
        datname = 'sismob_db';
    
    ALTER DATABASE sismob_db RENAME TO sismob_db3210;

    --DROP DATABASE sismob_db;

    CREATE DATABASE sismob_db
        WITH
        OWNER = ${user}
        ENCODING = 'UTF8'
        LC_COLLATE = 'Portuguese_Brazil.1252'
        LC_CTYPE = 'Portuguese_Brazil.1252'
        TABLESPACE = pg_default
        CONNECTION LIMIT = -1;
`
}

module.exports = { createDBQuery }

/* const thisWorked = `
SELECT  *
FROM pg_stat_activity
WHERE datname = 'sismob_db';

SELECT
    pg_terminate_backend (6636)
FROM
    pg_stat_activity
WHERE
    datname = 'sismob_db';

alter database sismob_db rename to sismob_db123
` */