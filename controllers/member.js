const Vocab = require("../models/vocab");

exports.getVocabs = (req, res, next) => {
  Vocab.findAll().then((vocabs) => {
    res.render("member/vocabs", {
      vocabs: vocabs,
      pageTitle: "Admin Vocabs",
      path: "/member/vocabs",
    });
  });
};

exports.getEditVocab = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const vocabId = req.params.vocabId;
  Vocab.findByPk(vocabId)
    .then((vocab) => {
      if (!vocab) {
        return res.redirect("/showcase");
      }
      res.render("member/edit-vocab", {
        pageTitle: "Edit Vocab",
        path: "/member/edit-vocab",
        editing: editMode,
        vocab: vocab,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditVocab = (req, res, next) => {
  const vocabId = req.body.vocabId;
  console.log("vocabId: ", vocabId);
  Vocab.findByPk(vocabId)
    .then((vocab) => {
      console.log("vocab: ", vocab);
      vocab.title = req.body.title;
      vocab.type = req.body.type;
      vocab.meaning = req.body.meaning;
      vocab.example = req.body.example;
      return vocab.save();
    })
    .then((result) => {
      console.log("UPDATED VOCAB!");
      res.redirect("/member/vocabs");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteVocab = (req, res, next) => {
  const vocabId = req.body.vocabId;
  Vocab.findByPk(vocabId)
    .then((vocab) => {
      return vocab.destroy();
    })
    .then((result) => {
      console.log("DESTROYED VOCAB");
      res.redirect("/member/vocabs");
    })
    .catch((err) => console.log(err));
};
