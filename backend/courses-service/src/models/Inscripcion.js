const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Curso = require('./Curso');

const Inscripcion = sequelize.define('Inscripcion', {
    alumnoEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    calificacionFinal: {
        type: DataTypes.FLOAT, // Puede ser numérico o string segun preferencia, usamos float por ahora
        allowNull: true
    },
    fechaInscripcion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

Inscripcion.belongsTo(Curso);
Curso.hasMany(Inscripcion);

module.exports = Inscripcion;
