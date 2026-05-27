const mysql = require('mysql');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3305;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'notasweb_db';

const pool = mysql.createPool({
	connectionLimit: 10,
	host: DB_HOST,
	port: DB_PORT,
	user: DB_USER,
	password: DB_PASS,
	database: DB_NAME,
	connectTimeout: 10000,
});

pool.getConnection((err, connection) => {
	if (err) {
		console.error('✗ Error de conexión:', err.message || err);
	} else {
		console.log('✓ Conexión a MySQL ');
		connection.release();
	}
});

module.exports = pool;