const path = require("path");
const Vocab = require("../models/vocab");

const { validationResult } = require("express-validator");

const ITEMS_PER_PAGE = 2;

exports.getAddVocab = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
};

exports.postAddVocab = (req, res, next) => {
  const image = req.file;
  const imageUrl = image?.path ?? "";

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res
      .status(422)
      .sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
  }
  req.user
    .createVocab({
      title: req.body.title,
      type: req.body.type,
      meaning: req.body.meaning,
      example: req.body.example,
      imageUrl: imageUrl,
    })
    .then((result) => {
      console.log("Created Vocab");
      res.redirect("/member/vocabs");
    })
    .catch((error) => {
      throw new Error(error);
    });
};

exports.getShowcase = async (req, res, next) => {
  const pageNumber = req.query.page ?? 1;
  const totalVocab = await Vocab.count();

  Vocab.findAll({
    offset: (pageNumber - 1) * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
  })
    .then((vocabs) => {
      res.render("showcase", {
        vocabs: vocabs,
        pageTitle: "showcase",
        path: "/showcase",
        isAuthenticated: false,
        totalPage: Math.ceil(totalVocab / ITEMS_PER_PAGE)
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
