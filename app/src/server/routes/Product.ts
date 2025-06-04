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
router.get("/get/:id", async(req, res) =>  {
	const id: string = req.params.id
	let conn
	try {
		conn = await pool.getConnection()
		const rows = await pool.query("SELECT * FROM products WHERE id = ?", id)
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
	const qty: string = req.body.qty

	let conn
	try {
		conn = await pool.getConnection()
		const rows = await pool.query(
			"INSERT INTO products (name, price, description, available, qty) VALUES (?, ?, ?, ?, ?)",
		[name, price, description, available, qty])
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to update product
router.put('/update', async(req, res) =>  {
	// const id: string = req.params.id
	const product = req.body.product
	const { name, price, description, available, qty, id } = product

	let conn
	try {
		conn = await pool.getConnection()
		await pool.query(`
			UPDATE products 
				SET 
					name = ?,
					price = ?,
					description = ?,
					available = ?,
					qty = ?
			WHERE id = ?`, [name, price, description, available, qty, id])
		res.status(200)
		console.log(res.status)
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
		const rows = await pool.query("DELETE FROM products WHERE id = ?", id)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


export default router
