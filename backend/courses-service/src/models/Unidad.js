const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Curso = require('./Curso');

const Unidad = sequelize.define('Unidad', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

Unidad.belongsTo(Curso);
Curso.hasMany(Unidad);

module.exports = Unidad;
