// import requirements
const express = require("express")
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const helmet = require("helmet")

// get environment variables
require("dotenv").config()

const app = express()

// Middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static("public"))
app.use(cookieParser())
app.use(helmet())

// use ether a IP limter (in Production), or use morgan logging
if (process.env.NODE_ENV === 'production') app.use(require("./middleware/limiter"));
  else app.use(morgan('dev'))

//database
const { connectDB, disconnectDB } = require('./middleware/db');
app.use(connectDB) // Connect to the Database
app.use(disconnectDB) // Disconnects from DB after res send

// Routes
app.use("/api/blog/", require("./routes/blog"))
app.use("/api/auth", require("./routes/auth"))
app.use("/api/search", require("./routes/search"))
app.use("/api/comment", require("./routes/comment"))

// use error handler
app.use(require("./middleware/errorHandler"))


// Start server
app.listen(process.env.PORT || 3000, () => console.log(`Server is Listening on http://localhost:${process.env.PORT || 3000}`))
