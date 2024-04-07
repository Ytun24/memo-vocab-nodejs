const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vocabSchema = new Schema(
    {
      title: {
        type: String,
        required: true
      },
      imageUrl: {
        type: String,
        required: false
      },
      meaning: {
        type: String,
        required: true
      },
      creator: {
        type: Object,
        required: true
      }
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Vocab', vocabSchema);
  