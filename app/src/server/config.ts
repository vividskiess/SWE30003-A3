
import mariadb from "mariadb"
import dotenv from 'dotenv'
dotenv.config({ path: '../../.env' })

const pool = mariadb.createPool({
	host: process.env.DB_HOST, 
	user: process.env.DB_USER, 
	database: process.env.DB_DATABASE,
	connectionLimit: 100
})

// console.log("Total connections: ", pool.totalConnections());
// console.log("Active connections: ", pool.activeConnections());
// console.log("Idle connections: ", pool.idleConnections());

// async function main() {
// 	let conn;

// 	try {
//       conn = await fetchConn();

//       // Use Connection
//       var rows = await get_contacts(conn);
//       for (let i = 0, len = rows.length; i < len; i++) {
// 				console.log("Total connections: ", pool.totalConnections());
// 				console.log("Active connections: ", pool.activeConnections());
// 				console.log("Idle connections: ", pool.idleConnections());

// 				console.log(`${rows[i].first_name} ${rows[i].last_name} <${rows[i].email}>`);
//       }
// 	} catch (err) {
//       // Manage Errors
//       console.log(err);
// 	} finally {
//       // Close Connection
//       if (conn) conn.end();
// 	}
// }

// // Fetch Connection
// async function fetchConn() {
// 	let conn = await pool.getConnection();
// 	console.log("Total connections: ", pool.totalConnections());
// 	console.log("Active connections: ", pool.activeConnections());
// 	console.log("Idle connections: ", pool.idleConnections());
// 	return conn;
// }

// //Get list of contacts
// async function get_contacts(conn) {
// 	return await conn.query("SELECT first_name, last_name, email FROM test.contacts");
// }
// main();

export default pool

