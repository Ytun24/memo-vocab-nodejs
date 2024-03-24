const express = require("express");

const router = express.Router();

const vocabController = require("../controllers/vocab")
const memberController = require("../controllers/member")

router.get("/add-vocab", vocabController.getAddVocab);
router.post("/add-vocab", vocabController.postAddVocab);

router.post("/favorite-vocab", vocabController.postFavoriteVocab);


router.get('/vocabs', memberController.getVocabs);

router.get('/edit-vocab/:vocabId', memberController.getEditVocab);
router.post('/edit-vocab', memberController.postEditVocab);
router.post('/delete-vocab', memberController.postDeleteVocab);

module.exports = router;

