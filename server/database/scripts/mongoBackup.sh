for i in empresaDocs.chunks empresaDocs.files vehicleDocs.chunks vehicleDocs.files
	do
		excludeCollections+='--excludeCollection '$i' ' 
	done

date=$(date '+%d-%m-%Y')

echo Running comand: mongodump --db sismob_db $excludeCollections --out C:\\backup\\mongoDB\\$date... 
mongodump --db sismob_db $excludeCollections --out C:\\backup\\mongoDB\\$date
