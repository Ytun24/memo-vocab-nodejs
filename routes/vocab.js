const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const vocabController = require("../controllers/vocab");

router.get("/vocabs", vocabController.getVocabs);
router.get("/vocab/:vocabId", vocabController.getVocab);
router.post(
  "/vocab",
  [
    body("title").trim().isLength({ min: 5 }),
    body("meaning").trim().isLength({ min: 5 }),
  ],
  vocabController.postVocab
);
router.put("/vocab/vocabId", vocabController.updateVocab);
router.delete("/vocab/vocabId", vocabController.deleteVocab);

module.exports = router;
