const express = require("express");
const path = require("path");

const router = express.Router();

const vocabController = require("../controllers/vocab")

router.get('/', vocabController.getShowcase);
router.get('/vocab/:vocabId', vocabController.getVocabById);

module.exports = router;
