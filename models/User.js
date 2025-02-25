const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de importar la configuración de la BD

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users', // Nombre de la tabla en la base de datos
  timestamps: true // Agrega `createdAt` y `updatedAt`
});

module.exports = User;
