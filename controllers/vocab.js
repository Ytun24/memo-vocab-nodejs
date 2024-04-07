const Vocab = require("../models/vocab");
const { validationResult } = require("express-validator");

exports.getVocabs = (req, res, next) => {
  res.status(200).json({
    message: "get vocab successfully!",
    vocabs: [
      {
        _id: "1",
        title: "First Vocab",
        content: "This is the first vocab!",
        imageUrl: "images/duck.jpg",
        creator: {
          name: "Ying",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.postVocab = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, entered data is incorrect.",
      errors: errors.array(),
    });
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
    .catch((err) => console.log(err));
};
