exports.getVocabs = (req, res, next) => {
  res.status(200).json({ message: "get vocab successfully!" });
};

exports.postVocab = (req, res, next) => {
  const title = req.body.title;
  const meaning = req.body.meaning;

  res.status(201).json({ message: "post vocab successfully!", title, meaning });
};
