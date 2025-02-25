const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('WebOffice', 'postgres', '9282.QyM', {
  host: 'localhost',
  dialect: 'postgres', 
  logging: false, 
});

module.exports = sequelize;
