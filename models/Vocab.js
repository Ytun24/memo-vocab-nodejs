const vocabs = [];

module.exports = class Vocab {
  constructor(title, meaning) {
    this.title = title;
    this.meaning = meaning;
  }

  save() {
    vocabs.push(this)
  }

  static fetchAll() {
    return vocabs;
  }
};
