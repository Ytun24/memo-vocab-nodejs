const path = require("path");

const vocab = [];

exports.getAddVocab = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "add-vocab.html"));
};

exports.postAddVocab = (req, res, next) => {
  vocab.push({ title: req.body.title });
  res.redirect('/showcase');
};

exports.getShowcase = (req, res, next) => {
    res.render('showcase', {
        vocabs: vocab,
        pageTitle: 'showcase',
        path: '/showcase',
      });
};

exports.vocab = vocab;
