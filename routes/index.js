const router = require("express").Router()
const jwt = require('jsonwebtoken')

router.get("/", async (req, res) => {
    const db = req.db
    try {
        if (!req.cookies.token) {
            return res.json({ success: false, error: "You are not logged in.", errorCode: 1011 });
        }

        const token = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        const user = token.user;

        const result = await db.query("SELECT * FROM posts WHERE user_id = $1", [user.id]);
        const posts = result.rows;

        res.json({ success: true, result: posts });
    } catch (error) {
        const err = { success: false, error: "An error occurred.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

router.get("/:id", (req, res) => {
    res.json({success: true, message: "hello!"})
})

module.exports = router