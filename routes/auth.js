const router = require("express").Router()
const pw = require("../middleware/password")
const verify = require("../middleware/verify")
const jwt = require('jsonwebtoken')
const validator = require('validator');

/**
 * Login route. Requires username and password in the request body. Returns an JWT token as Cockie.
 */
router.post("/login", async (req, res) => {
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
        return res.json({success: true, message: "Successful logged in.", token})
    } else {
        const err = {success: false, error: "Wrong Username or Password.", errorCode: 1006}
        return res.json(err)
    }

})

/**
 * Register route. Requires email, username and password in the request body.
 */
router.post("/register", async (req, res) => {
    const db = req.db

    if (!req.body.username || !req.body.password  || !req.body.email) {
        const err = {success: false, error: "Email, username and password required.", errorCode: 1002}
        return res.json(err)
    }

    if (req.body.password.length < 5) {
        const err = {success: false, error: "Password to weak, at least 5 characters  required.", errorCode: 1001}
        return res.json(err)
    }

    if (!validator.isEmail(req.body.email)) {
        const err = {success: false, error: "Email address not valid.", errorCode: 1001}
        return res.json(err)
    }

    const { username, password, email } = req.body

    try {
        const passwordHash = await pw.hash(password)
        await db.query("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", [username, passwordHash, email])
        res.json({success: true, message: "Registration Successful."})
    } catch (error) {
        // Handle errors
        if (error.constraint === 'users_username_key') {
            const err = { success: false, error: "Username already exists!", errorCode: 1004 };
            console.log(err, error);
            res.json(err);
        } else if (error.constraint === 'users_email_key') {
                const err = { success: false, error: "Email already exists!", errorCode: 1004 };
                console.log(err, error);
                res.json(err);
        } else {
            const err = { success: false, error: "An error occurred.", errorCode: 1003 };
            console.log(err, error);
            res.json(err);
        }
    }

})

/**
 * Logout route. Login required
 */
router.get("/logout", async (req, res) => {
    res.clearCookie("token")
    res.json({ success: true, message: "Logout successful." });
})


/**
 * Delete user and posts route. Login required
 */
router.delete("/", verify, async (req, res) => {
    const db = req.db

    try {
        const user = req.user;

        await db.query("DELETE FROM comments WHERE user_id = $1", [user.id]);
        await db.query("DELETE FROM posts WHERE user_id = $1", [user.id]);
        await db.query("DELETE FROM users WHERE id = $1", [user.id]);

        res.json({ success: true, result: "Succesful deleted your Account" });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }

})

/**
 * Change password route. Login required. Logges the user out.
 */
router.patch("/change-password", verify, async (req, res) => {
    const db = req.db

    try {
        const user = req.user;
        const password = req.body.password

        if (req.body.password.length < 5) {
            const err = {success: false, error: "Password to weak, at least 5 characters  required.", errorCode: 1001}
            return res.json(err)
        }

        const passwordHash = await pw.hash(password)
        await db.query("UPDATE users SET password = $2 WHERE id = $1", [user.id, passwordHash]);
        res.clearCookie("token")

        res.json({ success: true, result: "Succesful updated your Password. You have to login again." });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }

})

/**
 * Change username route. Login required. Logges the user out.
 */
router.patch("/change-username", verify, async (req, res) => {
    const db = req.db

    try {
        const user = req.user;
        const username = req.body.username

        await db.query("UPDATE users SET username = $2 WHERE id = $1", [user.id, username]);
        res.clearCookie("token")

        res.json({ success: true, result: "Succesful updated your Username. You have to login again." });

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

/**
 * Change username route. Login required. Logges the user out.
 */
router.patch("/change-email", verify, async (req, res) => {
    const db = req.db

    try {
        const user = req.user;
        const email = req.body.email

        if (!validator.isEmail(req.body.email)) {
            const err = {success: false, error: "Email address not valid.", errorCode: 1001}
            return res.json(err)
        }

        await db.query("UPDATE users SET email = $2 WHERE id = $1", [user.id, email]);
        res.clearCookie("token")

        res.json({ success: true, result: "Succesful updated your Email address. You have to login again." });

    } catch (error) {
        // Handle errors
        if (error.constraint === 'users_email_key') {
                const err = { success: false, error: "Email already exists!", errorCode: 1004 };
                console.log(err, error);
                res.json(err);
        } else {
            const err = { success: false, error: "An error occurred.", errorCode: 1003 };
            console.log(err, error);
            res.json(err);
        }
    }

})

module.exports = router