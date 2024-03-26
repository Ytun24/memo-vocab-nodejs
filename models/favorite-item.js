const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const FavoriteItem = sequelize.define('favoriteItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  priority: Sequelize.INTEGER
});

module.exports = FavoriteItem;
