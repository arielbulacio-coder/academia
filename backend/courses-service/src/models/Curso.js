const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Curso = sequelize.define('Curso', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finalizado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    EscuelaId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    duracion_horas: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    modalidad: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profesorId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Curso;
