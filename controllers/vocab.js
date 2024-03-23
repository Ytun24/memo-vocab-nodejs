const path = require("path");
const Vocab = require("../models/Vocab");
const vocab = [];

exports.getAddVocab = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
};

exports.postAddVocab = (req, res, next) => {
  const vocab = new Vocab(req.body.title);
  vocab.save();
  res.redirect("/showcase");
};

exports.getShowcase = (req, res, next) => {
  res.render("showcase", {
    vocabs: Vocab.fetchAll(),
    pageTitle: "showcase",
    path: "/showcase",
  });
};

exports.getVocabById = (req, res, next) => {
    const vocab = Vocab.getById(req.params.vocabId)
    res.send(JSON.stringify(vocab));
};

exports.vocab = vocab;
exports.postFavoriteVocab = (req, res, next) => {
  console.log("vocabId", req.body);
  res.redirect("/showcase");
};
