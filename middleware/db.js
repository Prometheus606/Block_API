const connectDB = async (req, res, next) => {

    try {
        const pg = require("pg")

        let db;

        if (process.env.PG_URL) {
            db = new pg.Client({
                connectionString: process.env.PG_URL,
                ssl: true
            })
        } else {
            db = new pg.Client({
                user: process.env.PG_USER,
                password: process.env.PG_PW,
                port: process.env.PG_PORT,
                database: process.env.PG_DB,
                host: process.env.PG_HOST
            })
        }

        db.connect()
    
        await db.query(`
            CREATE TABLE IF NOT EXISTS blog_api_users (
                id SERIAL PRIMARY KEY, 
                email TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL UNIQUE, 
                password TEXT NOT NULL
            )
        `)
        await db.query(`
            CREATE TABLE IF NOT EXISTS blog_api_posts (
                id SERIAL PRIMARY KEY, 
                user_id INT REFERENCES blog_api_users(id),
                title TEXT NOT NULL, 
                content TEXT NOT NULL, 
                date DATE NOT NULL DEFAULT CURRENT_DATE
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS blog_api_comments (
                id SERIAL PRIMARY KEY, 
                user_id INT REFERENCES blog_api_users(id),
                post_id INT REFERENCES blog_api_posts(id),
                content TEXT NOT NULL, 
                date DATE NOT NULL DEFAULT CURRENT_DATE
            )
        `);
        
        req.db = db

        next()

    } catch (error) {
        console.log(error);
        return res.json({success: false, code: 500, error:"Internal server Error", errorCode: 1010})
    }
}

const disconnectDB = (req, res, next) => {
    res.on('finish', () => {
        if (req.db) {
          req.db.end();
        }
    });
    next(); 
}

module.exports = {connectDB, disconnectDB}

