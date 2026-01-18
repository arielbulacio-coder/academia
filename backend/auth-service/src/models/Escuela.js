const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Escuela = sequelize.define('Escuela', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    logo: {
        type: DataTypes.STRING, // URL
        allowNull: true
    }
});

module.exports = Escuela;
