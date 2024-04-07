const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const vocabController = require("../controllers/vocab");

router.get("/vocabs", vocabController.getVocabs);
router.post(
  "/vocab",
  [
    body("title").trim().isLength({ min: 2 }),
    body("meaning").trim().isLength({ min: 5 }),
  ],
  vocabController.postVocab
);

module.exports = router;
