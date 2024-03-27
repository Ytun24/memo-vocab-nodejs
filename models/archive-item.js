const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ArchiveItem = sequelize.define('archiveItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  priority: Sequelize.INTEGER
});

module.exports = ArchiveItem;
