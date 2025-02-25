const sequelize = require('../config/database');
const User = require('./User');

// Sincroniza los modelos con la base de datos
sequelize.sync({ force: false }).then(() => {
  console.log('Database synchronized');
});

module.exports = {
  sequelize,
  User,
};