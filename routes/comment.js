const router = require("express").Router()
const verify = require("../middleware/verify")

/**
 * Get all posts from user route. Login required.
 */
router.get("/all", verify, async (req, res) => {
    const db = req.db
    try {
        const user = req.user;

        const result = await db.query("SELECT * FROM blog_api_comments WHERE user_id = $1", [user.id]);
        const posts = result.rows;
        console.log(posts);

        res.json({ success: true, result: posts });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1100 };
        console.log(err, error);
        res.json(err);
    }
});

/**
 * Gets an specific comment. Login required. post id required as query param
 */
router.get("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        const result = await db.query("SELECT * FROM blog_api_comments WHERE id = $1 AND user_id = $2", [id, user.id]);

        if (result.rows.length < 1) {
            const err = { success: false, error: "Comment not found", errorCode: 1101 };
            return res.json(err);
        }
        const post = result.rows[0];

        res.json({ success: true, result: post });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1102 };
        console.log(err, error);
        res.json(err);
    }
});

/**
 * Creates a comment. Login required. content required as body parameter
 */
router.post("/", verify, async (req, res) => {
    const db = req.db
    try {
        const user = req.user;

        const result = await db.query("INSERT INTO blog_api_comments (user_id, content, post_id) VALUES ($1, $2, $3) RETURNING *", [user.id, req.body.content, req.body.postID]);
        const post = result.rows[0];

        res.json({ success: true, result: post });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1103 };
        console.log(err, error);
        res.json(err);
    }
});

/**
 * Updates a comment. Login required. content required as body parameter, post id as query param
 */
router.put("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        result = await db.query("UPDATE blog_api_comments SET content= $2 WHERE id=$1 AND user_id = $3 RETURNING *", [id, req.body.content, user.id]);

        if (result.rows.length < 1) {
            const err = { success: false, error: "Comment not found", errorCode: 1104 };
            return res.json(err);
        }

        const post = result.rows[0];

        res.json({ success: true, result: post });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1105 };
        console.log(err, error);
        res.json(err);
    }
});

/**
 * Deletes a comment. Login required. post id required as query param
 */
router.delete("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        let result = await db.query("SELECT * FROM blog_api_comments WHERE id=$1 AND user_id = $2", [id, user.id]);

        if (result.rows.length < 1) {
            const err = { success: false, error: "Comment not found", errorCode: 1106 };
            return res.json(err);
        }

        await db.query("DELETE FROM blog_api_comments WHERE id=$1 AND user_id = $2", [id, user.id]);

        res.json({ success: true, message: "Successful deleted your Comment." });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1107 };
        console.log(err, error);
        res.json(err);
    }
});



module.exports = router