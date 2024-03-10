const jwt = require('jsonwebtoken')
const router = require("express").Router()
const pw = require("../middleware/password")

router.get("/login", async (req, res) => {
    const db = req.db

    if (!req.body.username || !req.body.password) {
        const err = {success: false, error: "Username and password required.", errorCode: 1005}
        return res.json(err)
    }

    const { username, password } = req.body

    const result = await db.query("SELECT * FROM users WHERE username=$1", [username])

    if (result.rows.length !== 1) {
        const err = {success: false, error: "User not found.", errorCode: 1007}
        return res.json(err)
    }
    const user = result.rows[0]
    if (await pw.verify(password, user.password)) {
        const token = jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: process.env.JWT_EXPIRE });
        res.cookie('token', token, { maxAge: process.env.COCKIE_EXPIRE });
        return res.json({success: true, error: "Successful logged in."})
    } else {
        const err = {success: false, error: "Wrong Username or Password.", errorCode: 1006}
        return res.json(err)
    }

})

router.get("/register", async (req, res) => {
    const db = req.db

    if (!req.body.username || !req.body.password) {
        const err = {success: false, error: "Username and password required.", errorCode: 1002}
        return res.json(err)
    }

    if (req.body.password.length < 5) {
        const err = {success: false, error: "Password to weak, at least 5 characters  required.", errorCode: 1001}
        return res.json(err)
    }

    const { username, password } = req.body

    try {
        const passwordHash = await pw.hash(password)
        await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, passwordHash])
        res.json({success: true, message: "Registration Successful."})
    } catch (error) {
        // Handle errors
        if (error.constraint === 'users_username_key') {
            const err = { success: false, error: "Username already exists!", errorCode: 1004 };
            console.log(err, error);
            res.json(err);
        } else {
            const err = { success: false, error: "An error occurred.", errorCode: 1003 };
            console.log(err, error);
            res.json(err);
        }
    }

})

router.get("/logout", async (req, res) => {
    res.clearCookie("token")
    res.json({ success: true, message: "Logout successful." });
})

module.exports = router