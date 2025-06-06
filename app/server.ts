import express from 'express'
import cors from 'cors'
import User from "./server/routes/User"
import Product from "./server/routes/Product"

import dotenv from 'dotenv'

dotenv.config({ path: './.env' })
console.log(process.env.DB_USER)

const app = express()
const PORT: string | number = process.env.PORT || 3000

app.set('port', PORT)
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use("/user", User)
app.use("/product", Product)


app.get("/test", function (_req, res) {
	res.send("Hello World")
	// res.json("Hello World")
})


app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`)
})
