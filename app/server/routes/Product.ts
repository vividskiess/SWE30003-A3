import express from 'express'
import { config } from '../config'
import { PoolConnection } from 'mariadb'

const router = express.Router()


// Route to get all products
router.get("/getAll", async(_req, res): Promise<void> =>  {
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM products")
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
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM products WHERE id = ?", id)
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
	const price: number = req.body.price
	const description: string = req.body.description
	const available: boolean = req.body.available
	const qty: number = req.body.qty || 0

	console.log(req.body)
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		await config.pool.query(
			"INSERT INTO products (name, price, description, available, qty) VALUES (?, ?, ?, ?, ?)",
		[name, price, description, available, qty])
		res.status(200)
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
	console.log(product)
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		await conn.query(`
			UPDATE products 
				SET 
					name = ?,
					price = ?,
					description = ?,
					available = ?,
					qty = ?
			WHERE id = ?`, [name, price, description, available, qty, Number(id)])
		res.status(200)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to delete a product
router.delete('/delete/:id', async(req, res) =>  {
	const id: string = req.params.id
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		await config.pool.query("DELETE FROM products WHERE id = ?", Number(id))
		res.status(200)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


export default router
