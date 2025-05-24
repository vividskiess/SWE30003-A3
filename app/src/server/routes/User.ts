import express from 'express'
import db from '../config'


const router = express.Router()


// Route to get all users
router.get("/getAll", function(req, res) {
	db.query("SELECT * FROM users", 
		(err, result) => {
			if(err) console.log(err)
			res.send(result)
		})
})


// Route to get one user
router.get("/get/:uid", function (req, res) {
	const uid: string = req.params.uid
	db.query("SELECT * FROM users WHERE uid = ?", 
		uid, 
		(err,result)=> {
			if(err) console.log(err)
			res.send(result)
		})   
})


// Route for creating a user
router.post('/create', function (req, res) {
	const account_type: string = req.body.account_type
	const first_name: string = req.body.first_name
	const last_name: string = req.body.last_name
	const address: string = req.body.address
	const email: string = req.body.email
	const password: string = req.body.password
	db.query("INSERT INTO users (account_type, first_name, last_name, address, email, password) VALUES (?, ?, ?, ?, ?, ?)",
		[account_type, first_name, last_name, address, email, password], 
		(err,result) => {
			if(err) console.log(err)
		console.log(result)
	})
})


// Route to update user
router.post('/update/:uid/:property', function(req, res) {
	const uid: string = req.params.uid
	const property: string = req.params.property
	const value: string = req.body.value
	db.query("UPDATE users SET property = value = WHERE uid = ?",
		[property, value, uid],
		(err,result) => {
			if(err) console.log(err)
			console.log(result)
		})
})


// Route to delete a user
router.delete('/delete/:uid', function(req, res) {
	const uid: string = req.params.uid
	db.query("DELETE FROM users WHERE uid = ?", 
		uid, 
		(err,result) => {
			if(err) console.log(err)
	}) 
})


export default router
