const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Unidad = require('./Unidad');

const Actividad = sequelize.define('Actividad', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('formulario', 'entrega', 'examen'),
        defaultValue: 'entrega'
    },
    consigna: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fechaEntrega: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

Actividad.belongsTo(Unidad);
Unidad.hasMany(Actividad);

module.exports = Actividad;
