import express from 'express'
import { config } from '../config'
import { PoolConnection } from 'mariadb'

const router = express.Router()


// Route to get all orders
router.get("/getAll", async(req, res): Promise<void> =>  {
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM orders")
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})

// Route to get all orders matching customer ID
router.get("/getAll/:uid", async(req, res): Promise<void> =>  {
	const uid: string = req.params.uid
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM orders WHERE customer_id = ?", uid)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})

// Route to get one order
router.get("/get/:id", async(req, res) =>  {
	const id: string = req.params.id
	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("SELECT * FROM orders WHERE id = ?", id)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route for creating an order
router.post('/create', async(req, res) =>  {
	const status: string = req.body.status
	const order_date: string = req.body.order_date
	const shipping_address: string = req.body.shipping_address
	const shipping_cost: string = req.body.shipping_cost
	const shipping_option: string = req.body.shipping_option
	const items: string = req.body.items

	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query(
			"INSERT INTO orders (status, order_date, shipping_address, shipping_cost, shipping_option, items) VALUES (?, ?, ?, ?, ?, ?)",
		[status, order_date, shipping_address, shipping_cost, shipping_option, items])
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to update order
router.post('/update/:id/:property', async(req, res) =>  {
	const id: string = req.params.id
	const property: string = req.params.property
	const value: string = req.body.value

	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("UPDATE orders SET property = value = WHERE id = ?",[property, value, id])
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


// Route to delete order
router.delete('/delete/:id', async(req, res) =>  {
	const id: string = req.params.id

	let conn: PoolConnection | undefined
	try {
		if (!config.pool) {
			res.status(500).send("Database pool is not initialised.")
			return
		}
		conn = await config.pool.getConnection()
		const rows = await config.pool.query("DELETE FROM orders WHERE id = ?", id)
		res.status(200).send(rows)
	}	catch(err: any) {
		res.status(400).send(err.message)
	} finally {
		if(conn) conn.end()
	}
})


export default router
