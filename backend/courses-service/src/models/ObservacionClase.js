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
    cantidadAlumnos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    metodologiaABP: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    itemsEvaluacion: {
        type: DataTypes.JSONB,
        // Ejemplo: { puntualidad: 5, claridad: 4, participacion: 3 }
        defaultValue: {}
    },
    comentarios: {
        type: DataTypes.TEXT
    },
    EscuelaId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = ObservacionClase;
