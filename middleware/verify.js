const jwt = require('jsonwebtoken')

const verify = (req, res, next) => {
    try {
        if (!req.cookies.token) {
            return res.json({ success: false, error: "You are not logged in.", errorCode: 1011 });
        }
    
        const token = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        req.user = token.user
    
        next()
    } catch (error) {
        const err = { success: false, error: "You are not logged in.", errorCode: 1012 };
        console.log(err, error);
        res.json(err);
    }

}

module.exports = verify