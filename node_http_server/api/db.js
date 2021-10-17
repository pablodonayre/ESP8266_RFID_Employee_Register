const mysql = require('mysql');

// https://www.quora.com/How-do-I-use-a-MySQL-pool-in-multiple-files-with-Node-js


// The following variables are being validated at the INDEX file
const HOST = process.env.MYSQL_HOST;
const PORT = process.env.MYSQL_PORT;
const USERNAME = process.env.MYSQL_USER;
const PASSWORD = process.env.MYSQL_PASSWORD;
const DATABASE = process.env.MYSQL_DATABASE;


const con = mysql.createConnection({
    connectionLimit: 10,
    host: HOST,
    user: USERNAME,
    password: PASSWORD,
    database: DATABASE
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports.con = con;

