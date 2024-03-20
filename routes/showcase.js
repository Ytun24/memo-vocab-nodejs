const express = require("express");
const path = require("path");

const router = express.Router();

const vocabController = require("../controllers/vocab")

router.get('/', vocabController.getShowcase);

module.exports = router;
