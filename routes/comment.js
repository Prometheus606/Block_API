const router = require("express").Router()
const verify = require("../middleware/verify")

router.get("/all", verify, async (req, res) => {
    const db = req.db
    try {
        const user = req.user;

        const result = await db.query("SELECT * FROM posts WHERE user_id = $1", [user.id]);
        const posts = result.rows;
        console.log(posts);

        res.json({ success: true, result: posts });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

router.get("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
        if (result.rows.length < 1) {
            const err = { success: false, error: "Post not found", errorCode: 1020 };
            return res.json(err);
        }
        const post = result.rows[0];

        res.json({ success: true, result: post });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

router.post("/", verify, async (req, res) => {
    const db = req.db
    try {
        const user = req.user;

        const result = await db.query("INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *", [user.id, req.body.title, req.body.content]);
        const post = result.rows[0];

        res.json({ success: true, result: post });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

router.put("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        const result = await db.query("UPDATE posts SET title= $2, content= $3 WHERE id=$1 RETURNING *", [id, req.body.title, req.body.content]);
        const post = result.rows[0];

        res.json({ success: true, result: post });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

router.delete("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        const result = await db.query("DELETE FROM posts WHERE id=$1", [id]);

        res.json({ success: true, message: "Successful deleted your Post." });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});



module.exports = router