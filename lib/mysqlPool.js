const mysql = require('mysql2/promise');

const mysqlHost = 'localhost';
const mysqlPort = process.env.MYSQL_PORT || 3306;
const mysqlDb = 'cs493-db';
const mysqlUser = 'guest';
const mysqlPassword = 'guest';


const mysqlPool = mysql.createPool({
  connectionLimit: 10,
  host: mysqlHost,
  port: mysqlPort,
  database: mysqlDb,
  user: mysqlUser,
  password: mysqlPassword
});

module.exports = mysqlPool;