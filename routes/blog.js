const router = require("express").Router()
const verify = require("../middleware/verify")

/**
 * Get all posts from user route. Login required.
 */
router.get("/all", verify, async (req, res) => {
    const db = req.db
    try {
        const user = req.user;

        const result = await db.query(`        
        SELECT posts.*, users.username as author
        FROM posts 
        LEFT JOIN users ON posts.user_id = users.id
        WHERE posts.id = $1`, [user.id]);

        const posts = result.rows;
        console.log(posts);

        res.json({ success: true, result: posts });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

/**
 * Get specific post with comments from user route. Login and post id required.
 */
router.get("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        const result = await db.query(`
        SELECT posts.*, users.username as author,
        comments.id as comment_id, comments.content as comment_content, comments.date as comment_date, 
        comment_users.username as comment_user_username
        FROM posts 
        LEFT JOIN comments ON posts.id = comments.post_id
        LEFT JOIN users as comment_users ON comments.user_id = comment_users.id
        LEFT JOIN users ON posts.user_id = users.id
        WHERE posts.id = $1
    `, [id]);
    
    if (result.rows.length < 1) {
        const err = { success: false, error: "Post not found", errorCode: 1020 };
        return res.json(err);
    }
    
    // Extract post details from the first row of the result
    const post = {
        id: result.rows[0].id,
        author: result.rows[0].author_username, // Using the username of the post author
        title: result.rows[0].title,
        content: result.rows[0].content,
        date: result.rows[0].date,
    };
    
    // Extract comments from the result and format them
    const comments = result.rows.map(row => ({
        id: row.comment_id,
        content: row.comment_content,
        date: row.comment_date,
        username: row.comment_user_username
    }));
    
    // Format the response JSON
    const responseData = {
        success: true,
        result: {
            post: post,
            comments: comments
        }
    };
    
    res.json(responseData);
    

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

/**
 * Create post route. Login required.
 */
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

/**
 * Update specific post from user route. Login required. post id as query param and title or content in request body required.
 */
router.put("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        const result = await db.query("UPDATE posts SET title= $2, content= $3 WHERE id=$1 AND user_id = $4 RETURNING *", [id, req.body.title, req.body.content, user.id]);
        const post = result.rows[0];

        if (result.rows.length < 1) {
            const err = { success: false, error: "Post not found", errorCode: 1020 };
            return res.json(err);
        }

        res.json({ success: true, result: post });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

/**
 * delete specific post from user route. Login required. post id as query param required.
 */
router.delete("/:id", verify, async (req, res) => {
    const db = req.db
    const id = req.params.id
    try {
        const user = req.user;

        let result = await db.query("SELECT * FROM posts WHERE id=$1 AND user_id = $2", [id, user.id]);

        if (result.rows.length < 1) {
            const err = { success: false, error: "Post not found", errorCode: 1020 };
            return res.json(err);
        }

        await db.query("DELETE FROM comments WHERE post_id = $1", [id]);
        result = await db.query("DELETE FROM posts WHERE id=$1 AND user_id = $2", [id, user.id]);

        res.json({ success: true, message: "Successful deleted your Post." });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});



module.exports = router