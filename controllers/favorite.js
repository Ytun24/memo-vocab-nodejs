const Vocab = require("../models/vocab");

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

exports.postFavoriteDeleteVocab = (req, res, next) => {
  const vocabId = req.body.vocabId;
  req.user
    .getFavorite({ where: { id: vocabId } })
    .then((favorite) => {
      return favorite.getVocabs();
    })
    .then((vocabs) => {
      res.send(vocabs);
      return vocabs[0].favoriteItem.destroy();
    })
    .then((result) => {
      console.log("Deleted vocab from favorite!");
      res.redirect("/favorite");
    })
    .catch((err) => console.log(err));
};

exports.postArchive = (req, res, next) => {
  let fetchedFavorite;
  req.user
    .getFavorite()
    .then((favorite) => {
      fetchedFavorite = favorite;
      return favorite.getVocabs();
    })
    .then((vocabs) => {
      return req.user
        .createArchive()
        .then((archive) => {
          return archive.addVocabs(
            vocabs.map((vocab) => {
              vocab.archiveItem = { priority: vocab.favoriteItem.priority };
              return vocab;
            })
          );
        })
        .catch((err) => console.log(err));
    })
    .then((result) => {
      return fetchedFavorite.setVocabs(null);
    })
    .then((result) => {
      res.redirect("/favorite/archives");
    })
    .catch((err) => console.log(err));
};

exports.getArchives = (req, res, next) => {
  req.user
    .getArchives({ include: ["vocabs"] })
    .then((archives) => res.send(archives))
    .catch();
};
