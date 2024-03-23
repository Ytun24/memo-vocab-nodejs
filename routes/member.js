const express = require("express");

const router = express.Router();

const vocabController = require("../controllers/vocab")

router.get("/add-vocab", vocabController.getAddVocab);
router.post("/add-vocab", vocabController.postAddVocab);

router.post("/favorite-vocab", vocabController.postFavoriteVocab);

module.exports = router;

