const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Materia = sequelize.define('Materia', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tipo: {
        type: DataTypes.STRING,
        defaultValue: 'teoria'
    }
});

module.exports = Materia;
