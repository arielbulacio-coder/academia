const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Evaluacion = require('./Evaluacion');

const Calificacion = sequelize.define('Calificacion', {
    AlumnoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nota: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    detalles: {
        type: DataTypes.JSONB, // Stores internal details of the attempt if needed
        allowNull: true
    }
});

Calificacion.belongsTo(Evaluacion);
Evaluacion.hasMany(Calificacion);

module.exports = Calificacion;
