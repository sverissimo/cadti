restoreDate=$1

echo Running command: mongorestore -d=sismob_db_restored --dir=C:\\backup\\mongoDB\\$restoreDate\\sismob_db
mongorestore -d=sismob_db_restored --dir=C:\\backup\\mongoDB\\$restoreDate\\sismob_db
##mongorestore -d=tst --dir=$PATH/backup/mongoDB/sismob_db/${restoreDate}