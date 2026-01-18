const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ObservacionClase = sequelize.define('ObservacionClase', {
    directorEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profesorNombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    materiaValidada: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    itemsEvaluacion: {
        type: DataTypes.JSONB, // { puntualidad: 5, claridad: 4, participacion: 3 ... }
        allowNull: true
    },
    comentarios: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    EscuelaId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = ObservacionClase;
