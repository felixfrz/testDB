const mysql = require("mysql");


const conn = mysql.createConnection({
	host: 'bscxkv89qw5mbo1df39z-mysql.services.clever-cloud.com',
	user: 'u4tnwg8nx3fata6c',
	password: 'BkqQxOimpY3W8t9UDJcB',
	database: 'bscxkv89qw5mbo1df39z',
});

conn.connect((err)=>{
    if(err) throw err;
    console.log("MySQL Connected!");
});

module.exports = conn;