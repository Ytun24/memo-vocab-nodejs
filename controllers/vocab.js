const path = require("path");
const Vocab = require("../models/vocab");

exports.getAddVocab = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
};

exports.postAddVocab = (req, res, next) => {
  req.user
    .createVocab({
      title: req.body.title,
      type: req.body.type,
      meaning: req.body.meaning,
      example: req.body.example,
    })
    .then((result) => {
      console.log("Created Vocab");
      res.redirect("/member/vocabs");
    })
    .catch((error) => console.log(error));
};

exports.getShowcase = (req, res, next) => {
  Vocab.findAll()
    .then((vocabs) => {
      res.render("showcase", {
        vocabs: vocabs,
        pageTitle: "showcase",
        path: "/showcase",
        isAuthenticated: false
      });
    })
    .catch((error) => console.log(error));
};

exports.getVocabById = (req, res, next) => {
  req.user
  .getVocabs({ where: { id: req.params.vocabId } })
    .then((vocab) => {
      res.send(JSON.stringify(vocab[0]));
    })
    .catch((error) => console.log(error));
};

exports.postFavoriteVocab = (req, res, next) => {
  console.log("vocabId", req.body);
  res.redirect("/showcase");
};
