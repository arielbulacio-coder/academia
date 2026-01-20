const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Pregunta = require('./Pregunta');

const Opcion = sequelize.define('Opcion', {
    texto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    esCorrecta: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

Opcion.belongsTo(Pregunta);
Pregunta.hasMany(Opcion);

module.exports = Opcion;
