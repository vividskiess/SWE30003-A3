import express from 'express'
import { config } from '../config'
import { PoolConnection } from 'mariadb'


const router = express.Router()


// Route to get all users
router.get("/getAll", async(req, res): Promise<void> =>  {
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM users")
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to get one user
router.get("/get/:uid", async(req, res) =>  {
	const uid: string = req.params.uid

	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM users WHERE uid = ?", uid)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})

router.get("/getEmail/:email", async(req, res) =>  {
	const email: string = req.params.email
	console.log(email)
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM users WHERE email = ?", email)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})

// Route for creating a user
router.post('/create', async(req, res) =>  {
	const account_type: string = req.body.account_type
	const first_name: string = req.body.first_name
	const last_name: string = req.body.last_name
	const address: string = req.body.address
	const email: string = req.body.email
	const password: string = req.body.password


	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM users WHERE email = ?", email)

		if (rows.length > 0) {
			res.status(400).send(`Account with email: ${email} already exists.`)
			if(conn) conn.end()
			return
		}
		await config.pool.query(
			"INSERT INTO users (account_type, first_name, last_name, address, email, password) VALUES (?, ?, ?, ?, ?, ?)",
		[account_type, first_name, last_name, address, email, password])
		res.status(200)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to update user
router.post('/update/:uid/:property', async(req, res) =>  {
	const uid: string = req.params.uid
	const property: string = req.params.property
	const value: string = req.body.value

	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("UPDATE users SET property = value = WHERE uid = ?",[property, value, uid])
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to delete a user
router.delete('/delete/:uid', async(req, res) =>  {
	const uid: string = req.params.uid

	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("DELETE FROM users WHERE uid = ?", uid)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


export default router
