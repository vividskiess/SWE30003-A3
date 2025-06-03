import express from 'express'
import cors from 'cors'
import User from "./routes/User"
import Product from "./routes/Product"
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const app = express()
const PORT: string | number = process.env.PORT || 3000

app.set('port', PORT)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use("/user", User)
app.use("/product", Product)


app.get("/test", function (req, res) {
	let message: any = { message: "test" }
	res.send("Hello World")
	// res.json("Hello World")
})


app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`)
})
