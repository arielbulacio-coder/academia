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
        type: DataTypes.STRING, // URL de la imagen
        allowNull: true
    },
    finalizado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Curso;
