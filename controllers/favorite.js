const Vocab = require("../models/vocab")

exports.getFavorites = (req, res, next) => {
  req.user
    .getFavorite()
    .then((favorite) => {
      return favorite
        .getVocabs()
        .then((vocabs) => {
          res.render("member/favorite", {
            path: "/favorite",
            pageTitle: "Your Favorite",
            vocabs: vocabs,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postVocabToFavorite = (req, res, next) => {
  const vocabId = req.body.vocabId;
  console.log(vocabId);
  let fetchedFavorite;
  let newPriority = 1;
  req.user
    .getFavorite()
    .then((favorite) => {
      fetchedFavorite = favorite;
      return favorite.getVocabs({ where: { id: vocabId } });
    })
    .then((vocabs) => {
      let vocab;
      if (vocabs.length > 0) {
        vocab = vocabs[0];
      }

      if (vocab) {
        const oldPriority = vocab.favoriteItem.priority;
        newPriority = oldPriority + 1;
        return vocab;
      }
      return Vocab.findByPk(vocabId);
    })
    .then((vocab) => {
      return fetchedFavorite.addVocab(vocab, {
        through: { priority: newPriority },
      });
    })
    .then(() => {
      res.redirect("/favorite");
    })
    .catch((err) => console.log(err));
};
