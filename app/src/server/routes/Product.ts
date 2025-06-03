import express from 'express'
import pool from '../config'

const router = express.Router()


// Route to get all products
router.get("/getAll", async(req, res): Promise<void> =>  {
	let conn
	try {
		conn = await pool.getConnection()
		const rows = await pool.query("SELECT * FROM products")
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to get one product
router.get("/get/:uid", async(req, res) =>  {
	const uid: string = req.params.uid
	console.log(uid)
	let conn
	try {
		conn = await pool.getConnection()
		const rows = await pool.query("SELECT * FROM products WHERE uid = ?", uid)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route for creating a product
router.post('/create', async(req, res) =>  {
	const name: string = req.body.name
	const price: string = req.body.price
	const description: string = req.body.description
	const available: string = req.body.available
	let conn
	try {
		conn = await pool.getConnection()
		const rows = await pool.query(
			"INSERT INTO products (name, price, description, available) VALUES (?, ?, ?, ?)",
		[name, price, description, available])
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to update product
router.post('/update/:id/:property', async(req, res) =>  {
	const id: string = req.params.id
	const property: string = req.params.property
	const value: string = req.body.value
	let conn
	try {
		conn = await pool.getConnection()
		const rows = await pool.query("UPDATE products SET property = value = WHERE id = ?",[property, value, id])
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to delete a product
router.delete('/delete/:id', async(req, res) =>  {
	const id: string = req.params.id
	let conn
	try {
		conn = await pool.getConnection()
		const rows = await pool.query("DELETE FROM products WHERE uid = ?", id)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


export default router
