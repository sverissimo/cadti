docker cp ./sismob_db mongodb:/sismob_backup
docker exec -it mongodb bash
mongorestore -d=sismob_db --dir=/sismob_db

# OR:
# docker exec -i mongodb mongorestore -d=sismob_db --dir=/sismob_db
