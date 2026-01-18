const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Planificacion = sequelize.define('Planificacion', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    profesorEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profesorNombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    EscuelaId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    comentarios: {
        type: DataTypes.JSONB, // Array of { autor, texto, fecha }
        defaultValue: []
    },
    estado: {
        type: DataTypes.ENUM('borrador', 'publicada', 'aprobada', 'revision'),
        defaultValue: 'borrador'
    }
});

module.exports = Planificacion;
