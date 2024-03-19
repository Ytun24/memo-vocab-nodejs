const express = require("express");

const router = express.Router();

router.post('/add-vocab', (req, res, next) => {
  res.send(req.body);
});

module.exports = router;
