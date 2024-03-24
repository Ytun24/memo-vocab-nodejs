const path = require("path");
const Vocab = require("../models/vocab");

exports.getAddVocab = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
};

exports.postAddVocab = (req, res, next) => {
  Vocab.create({
    title: req.body.title,
    type: req.body.type,
    meaning: req.body.meaning,
    example: req.body.example,
  })
    .then((result) => {
      console.log("Created Vocab");
      res.redirect("/showcase");
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
      });
    })
    .catch((error) => console.log(error));
};

exports.getVocabById = (req, res, next) => {
  Vocab.findByPk(req.params.vocabId)
    .then((vocab) => {
      res.send(JSON.stringify(vocab));
    })
    .catch((error) => console.log(error));
};

exports.postFavoriteVocab = (req, res, next) => {
  console.log("vocabId", req.body);
  res.redirect("/showcase");
};
