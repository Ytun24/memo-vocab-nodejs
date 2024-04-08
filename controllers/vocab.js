const Vocab = require("../models/vocab");
const { validationResult } = require("express-validator");

exports.getVocabs = (req, res, next) => {
  Vocab.find()
    .then((vocabs) => {
      res.status(200).json({
        message: "get vocab successfully!",
        vocabs: vocabs,
      });
    })
    .catch((err) => next(err));
};

exports.getVocab = (req, res, next) => {
  const vocabId = req.params.vocabId;
  Vocab.findById(vocabId)
    .then((vocab) => {
      if (!vocab) {
        const error = new Error("No vocab found!");
        error.statusCose = 404;
        throw error;
      }
      res.status(200).json({ message: "get vocab successfully", vocab: vocab });
    })
    .catch((err) => next(err));
};

exports.postVocab = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation Result: ", errors.array());
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const meaning = req.body.meaning;
  const vocab = new Vocab({
    title,
    meaning,
    imageUrl: "images/baymax.jpg",
    creator: { name: "Ying" },
  });

  vocab
    .save()
    .then((result) => {
      res
        .status(201)
        .json({ message: "post vocab successfully!", vocab: result });
    })
    .catch((err) => next(err));
};
