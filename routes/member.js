const express = require("express");

const router = express.Router();

const vocabController = require("../controllers/vocab");
const memberController = require("../controllers/member");
const isAuth = require("../middleware/is-auth");

const { body } = require("express-validator")

router.get("/add-vocab", isAuth, vocabController.getAddVocab);
router.post("/add-vocab", isAuth, body("title").isAlpha('en-US', {ignore: ' '}), vocabController.postAddVocab);

router.post("/favorite-vocab", isAuth, vocabController.postFavoriteVocab);

router.get("/vocabs", isAuth, memberController.getVocabs);

router.get("/edit-vocab/:vocabId", isAuth, memberController.getEditVocab);
router.post("/edit-vocab", isAuth, memberController.postEditVocab);
router.post("/delete-vocab", isAuth, memberController.postDeleteVocab);

module.exports = router;
