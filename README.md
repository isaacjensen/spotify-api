## Run these commands in order to get the MySQL docker database running

`docker network create cs493-final`

`docker run -d --name mysql-server-final            
    --network cs493-final                    
    -p "3306:3306"                        
    -e "MYSQL_RANDOM_ROOT_PASSWORD=yes"    
    -e "MYSQL_DATABASE=cs493-db"        
    -e "MYSQL_USER=guest"            
    -e "MYSQL_PASSWORD=guest"             
    mysql`

`docker run --rm -it        
    --network cs493-final    
    mysql            
        mysql -h mysql-server-final  -u guest -p`

Once you're in the docker database run :`USE cs493-db;`

Then add the dummy data
