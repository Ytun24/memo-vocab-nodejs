const vocabs = [];

const db = require("../util/database");

module.exports = class Vocab {
  constructor(title, type, meaning, example) {
    this.title = title;
    this.type = type;
    this.meaning = meaning;
    this.example = example;
  }

  save() {
    return db.execute(
      "INSERT INTO vocabs (title, type, meaning, example) VALUES (?, ?, ?, ?)",
      [this.title, this.type, this.meaning, this.example]
    );
  }

  static fetchAll() {
    return db.execute("SELECT * FROM vocabs");
  }

  static getById(id) {
    return db.execute("SELECT * FROM vocabs WHERE vocabs.id = ?", [id]);
  }
};
