const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('memo-vocab', 'root', 'password', {
  dialect: 'mysql',
  host: 'localhost',
  storage: "sessions"
});

module.exports = sequelize;
