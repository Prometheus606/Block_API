const jwt = require('jsonwebtoken')
const router = require("express").Router()

router.get("/", (req, res, next) => {
    const user = {foo: "bar"}
    let token = jwt.sign(user, process.env.JWT_KEY, { expires: '1' });
    res.cookie(token)
})
