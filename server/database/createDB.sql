SELECT
        pg_terminate_backend (pid)
    FROM
        pg_stat_activity
    WHERE
        datname = 'sismob_db';
    
    ALTER DATABASE sismob_db RENAME TO sismob_db3210;

    DROP DATABASE IF EXISTS sismob_db;

    CREATE DATABASE sismob_db
        WITH
        OWNER = ${user}
        ENCODING = 'UTF8'
        LC_COLLATE = 'Portuguese_Brazil.1252'
        LC_CTYPE = 'Portuguese_Brazil.1252'
        TABLESPACE = pg_default
        CONNECTION LIMIT = -1;