const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Favorite = sequelize.define('favorite', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = Favorite;
