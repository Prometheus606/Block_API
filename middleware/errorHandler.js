const router = require("express").Router();

// Middleware for custom error handling for not found routes
router.use((req, res, next) => {
  res.json({success: false, code: 404, error: 'Sorry, the page was not found!', errorCode: 1005});
});

// Middleware for general error handling
router.use((err, req, res, next) => {
  const error = {success: false, code: 500, error: 'Something went wrong!', errorCode: 1004}
  console.error(error, err.stack);
  res.json(error);
});

module.exports = router