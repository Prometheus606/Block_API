const router = require("express").Router()
const verify = require("../middleware/verify")

/**
 * Search post route. Login required. possible search params as query params are author and keywords.
 * Keywords can be a string with multiple words. If no param is given, this route returns all posts.
 */
router.get("/", verify, async (req, res) => {
    const db = req.db
    const params = []
    try {

        let sqlQuery = `
            SELECT blog_api_posts.id, blog_api_posts.title AS title, blog_api_posts.content AS content, blog_api_users.username 
            FROM blog_api_posts 
            INNER JOIN blog_api_users ON blog_api_posts.user_id = blog_api_users.id
            WHERE 1=1`;

        if (req.query.author) {
            sqlQuery += ` AND LOWER(username) = LOWER($1)`;
            params.push(req.query.author)
        }

        if (req.query.keywords) {
            const keywordArray = req.query.keywords.split(',').map(keyword => keyword.trim());
            const keywordConditions = keywordArray.map((keyword, index) => {
                return index === 0 ? `(title ILIKE LOWER('%${keyword}%') OR content ILIKE LOWER('%${keyword}%'))` : `OR (title ILIKE LOWER('%${keyword}%') OR content ILIKE LOWER('%${keyword}%'))`;
            }).join(' ');
            sqlQuery += ` AND (${keywordConditions})`;
        }

        const result = await db.query(sqlQuery, params);

        if (result.rows.length < 1) {
            const err = { success: true, error: "You search has 0 results.", errorCode: 1200 };
            return res.json(err);
        }
        const posts = result.rows;

        res.json({ success: true, result: posts });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1201 };
        console.log(err, error);
        res.json(err);
    }
});

module.exports = router