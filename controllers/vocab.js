const path = require("path");
const Vocab = require("../models/Vocab");

exports.getAddVocab = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
};

exports.postAddVocab = (req, res, next) => {
  const vocab = new Vocab(
    req.body.title,
    req.body.type,
    req.body.meaning,
    req.body.example
  );
  vocab
    .save()
    .then(() => res.redirect("/showcase"))
    .catch((error) => console.log(error));
};

exports.getShowcase = (req, res, next) => {
  Vocab.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("showcase", {
        vocabs: rows,
        pageTitle: "showcase",
        path: "/showcase",
      });
    })
    .catch((error) => console.log(error));
};

exports.getVocabById = (req, res, next) => {
  Vocab.getById(req.params.vocabId)
    .then(([rows]) => {
      res.send(JSON.stringify(rows[0]));
    })
    .catch((error) => console.log(error));
};

exports.postFavoriteVocab = (req, res, next) => {
  console.log("vocabId", req.body);
  res.redirect("/showcase");
};
