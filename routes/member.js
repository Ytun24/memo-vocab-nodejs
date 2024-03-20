const express = require("express");

const router = express.Router();

const path = require("path");

router.get("/add-vocab", (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
});

router.post("/add-vocab", (req, res, next) => {
  res.send(req.body);
});

module.exports = router;
