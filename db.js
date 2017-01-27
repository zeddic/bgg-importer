/** @fileoverview Creates a connection pool to a MySql database. */

const mysql = require('promise-mysql');

const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'sample_admin',
  password : 'sample_password',
  database : 'sample_database',
  connectionLimit: 50,
});

exports.pool = function() {
    return pool;
}

exports.getConnection = function() {
    return pool.getConnection;
}
