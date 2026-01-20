const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Unidad = require('./Unidad');

const Evaluacion = sequelize.define('Evaluacion', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

Evaluacion.belongsTo(Unidad);
Unidad.hasMany(Evaluacion);

module.exports = Evaluacion;
