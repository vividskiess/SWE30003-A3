import express from 'express'
import db from './config/db'
import cors from 'cors'

import User from "./routes/User"
import StoreCatalogue from './routes/StoreCatalogue'
import Product from "./routes/Product"

const app = express()
const PORT: number = 1234
app.use(cors())
app.use(express.json())

app.use("/user", User)
app.use("/storeCatalogue", StoreCatalogue)
app.use("/product", Product)


app.get("/test", function (req, res) {
	res.status(200).send = (test: "test")
})


app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`)
})
