const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Evaluacion = require('./Evaluacion');

const Pregunta = sequelize.define('Pregunta', {
    enunciado: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    puntos: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
});

Pregunta.belongsTo(Evaluacion);
Evaluacion.hasMany(Pregunta);

module.exports = Pregunta;
