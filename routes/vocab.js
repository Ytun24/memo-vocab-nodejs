const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const vocabController = require("../controllers/vocab");
const isAuth = require("../middleware/is-auth");

router.get("/vocabs", isAuth, vocabController.getVocabs);
router.get("/vocab/:vocabId", vocabController.getVocab);
router.post(
  "/vocab",
  isAuth,
  [
    body("title").trim().isLength({ min: 1 }),
    body("meaning").trim().isLength({ min: 1 }),
  ],
  vocabController.postVocab
);
router.put(
  "/vocab/vocabId",
  [
    body("title").trim().isLength({ min: 2 }),
    body("meaning").trim().isLength({ min: 5 }),
  ],
  vocabController.updateVocab
);
router.delete("/vocab/vocabId", vocabController.deleteVocab);

module.exports = router;
