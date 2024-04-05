const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Vocab = sequelize.define("vocab", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING,
  },
  meaning: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  example: {
    type: Sequelize.STRING,
  },
  imageUrl: {
    type: Sequelize.STRING,
  },
});

module.exports = Vocab;
