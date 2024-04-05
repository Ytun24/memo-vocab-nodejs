const path = require("path");
const Vocab = require("../models/vocab");

const { validationResult } = require("express-validator")

exports.getAddVocab = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
};

exports.postAddVocab = (req, res, next) => {
  const image = req.file;
  const imageUrl = image.path;
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
  }
  req.user
    .createVocab({
      title: req.body.title,
      type: req.body.type,
      meaning: req.body.meaning,
      example: req.body.example,
      imageUrl: imageUrl
    })
    .then((result) => {
      console.log("Created Vocab");
      res.redirect("/member/vocabs");
    })
    .catch((error) => { throw new Error(error) });
};

exports.getShowcase = (req, res, next) => {
  Vocab.findAll()
    .then((vocabs) => {
      res.render("showcase", {
        vocabs: vocabs,
        pageTitle: "showcase",
        path: "/showcase",
        isAuthenticated: false,
      });
    })
    .catch((error) => console.log(error));
};

exports.getVocabById = (req, res, next) => {
  Vocab.findOne({ where: { id: req.params.vocabId } })
    .then((vocab) => {
      res.send(JSON.stringify(vocab[0]));
    })
    .catch((error) => console.log(error));
};

exports.postFavoriteVocab = (req, res, next) => {
  console.log("vocabId", req.body);
  res.redirect("/showcase");
};
