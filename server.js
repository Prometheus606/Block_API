// import requirements
const express = require("express")
const cookieParser = require('cookie-parser')

// get environment variables
require("dotenv").config()

const app = express()

// Middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static("public"))
app.use(cookieParser())

//database
const { connectDB, disconnectDB } = require('./middleware/db');
app.use(connectDB) // Connect to the Database
app.use(disconnectDB) // Disconnects from DB after res send

// Routes
app.use("/api/block", require("./routes/index"))
app.use("/api/auth", require("./routes/auth"))

// use error handler
app.use(require("./middleware/errorHandler"))


// Start server
app.listen(process.env.PORT || 3000, () => console.log(`Server is Listening on http://localhost:${process.env.PORT || 3000}`))
