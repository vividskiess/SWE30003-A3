
import mysql from 'mysql';


const db = mysql.createConnection({
	host: "feenix-mariadb.swin.edu.au",
	user: "s103031155",
	password: "190801",
	database:"s103031155_db" 
})


export default db

