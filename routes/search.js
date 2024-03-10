const router = require("express").Router()

/**
 * Search post route. No Login required. possible search params as query params are author and keywords.
 * Keywords can be a string with multiple words. If no param is given, this route returns all posts.
 */
router.get("/", async (req, res) => {
    const db = req.db
    const params = []
    try {

        let sqlQuery = `
            SELECT posts.title, posts.content, users.username 
            FROM posts 
            INNER JOIN users ON posts.user_id = users.id
            WHERE 1=1`; // Basisabfrage mit der Tabelle users joinen

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
            const err = { success: true, error: "You search has 0 results.", errorCode: 1020 };
            return res.json(err);
        }
        const posts = result.rows;

        res.json({ success: true, result: posts });

    } catch (error) {
        const err = { success: false, error: "An error occurred. You are not logged in or not provide all parameters. Read the documentation.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }
});

module.exports = router