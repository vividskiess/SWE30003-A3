import express from 'express'
import db from './config'
import cors from 'cors'

import User from "./routes/User"
import StoreCatalogue from './routes/StoreCatalogue'
import Product from "./routes/Product"

const app = express()
const PORT: string | number = process.env.PORT || 1234


app.set('port', PORT)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use("/user", User)
app.use("/storeCatalogue", StoreCatalogue)
app.use("/product", Product)


app.get("/test", function (req, res) {
	let message: any = { message: "test" }
	res.json = (message)
})


app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`)
})
