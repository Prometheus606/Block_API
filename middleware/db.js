const connectDB = async (req, res, next) => {

    try {
        const pg = require("pg")

        const db = new pg.Client({
            user: process.env.PG_USER,
            password: process.env.PG_PW,
            port: process.env.PG_PORT,
            database: process.env.PG_DB,
            host: process.env.PG_HOST
        })
        db.connect()
    
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY, 
                username TEXT NOT NULL UNIQUE, 
                password TEXT NOT NULL
            )
        `)
        await db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY, 
                user_id INT REFERENCES users(id),
                title TEXT NOT NULL, 
                content TEXT NOT NULL, 
                date DATE NOT NULL DEFAULT CURRENT_DATE
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY, 
                user_id INT REFERENCES users(id),
                post_id INT REFERENCES posts(id),
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

