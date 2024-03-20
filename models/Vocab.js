const vocabs = [];

module.exports = class Vocab {
  constructor(title, meaning) {
    this.title = title;
    this.meaning = meaning;
  }

  save() {
    this.id = Math.floor((Math.random() * 1000)).toString();
    vocabs.push(this);
  }

  static fetchAll() {
    return vocabs;
  }

  static getById(id) {
    const vocabById = vocabs.find(vocab => id == vocab.id)
    return vocabById;
  }
};
