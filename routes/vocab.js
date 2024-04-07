const express = require('express');
const router = express.Router();

const vocabController = require('../controllers/vocab');

router.get('/vocabs', vocabController.getVocabs);
router.post('/vocab', vocabController.postVocab);

module.exports = router;