const Vocab = require("../models/vocab");
const { validationResult } = require("express-validator");
const path = require("path");
const User = require("../models/user");

exports.getVocabs = async (req, res, next) => {
  const currentPage = req.query?.page || 1;
  const perPage = 4;
  let totalItems;

  try {
    const count = await Vocab.countDocuments({ creator: req.userId });
    totalItems = count;

    const vocabs = await Vocab.find({ creator: req.userId })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "get vocab successfully!",
      vocabs: vocabs,
      totalItems: totalItems,
    });
  } catch (err) {
    next(err);
  }
};

exports.getVocab = (req, res, next) => {
  const vocabId = req.params.vocabId;
  Vocab.findById(vocabId)
    .then((vocab) => {
      if (!vocab) {
        const error = new Error("No vocab found!");
        error.statusCose = 404;
        throw error;
      }
      res.status(200).json({ message: "get vocab successfully", vocab: vocab });
    })
    .catch((err) => next(err));
};

exports.postVocab = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      console.log("Validation Result: ", errors.array());
      const error = new Error("Invalid input");
      error.statusCode = 422;
      throw error;
    }

    const title = req.body.title;
    const meaning = req.body.meaning;
    const image = req?.file?.path ?? "";
    const user = await User.findById(req.userId);
    const vocab = new Vocab({
      title,
      meaning,
      imageUrl: image,
      creator: user,
    });
    const result = await vocab.save();
    res
      .status(201)
      .json({ message: "post vocab successfully!", vocab: result });
  } catch (err) {
    next(err);
  }
};

exports.updateVocab = (req, res, next) => {
  const vocabId = req.params.vocabId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const meaning = req.body.meaning;
  let imageUrl = req.body.image ?? "";
  if (req.file) {
    imageUrl = req.file.path;
  }
  Vocab.findById(vocabId)
    .then((vocab) => {
      if (!vocab) {
        const error = new Error("Could not find vocab.");
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== vocab.imageUrl) {
        clearImage(vocab.imageUrl);
      }
      vocab.title = title;
      vocab.imageUrl = imageUrl;
      vocab.meaning = meaning;
      return vocab.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Vocab updated!", vocab: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteVocab = (req, res, next) => {
  const vocabId = req.params.vocabId;
  Vocab.findById(vocabId)
    .then((vocab) => {
      if (!vocab) {
        const error = new Error("Could not find vocab.");
        error.statusCode = 404;
        throw error;
      }
      clearImage(vocab.imageUrl);
      return Vocab.findByIdAndRemove(vocabId);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Deleted vocab." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
