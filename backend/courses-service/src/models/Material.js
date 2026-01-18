const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Unidad = require('./Unidad');

const Material = sequelize.define('Material', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('pdf', 'word', 'video', 'link', 'otro'),
        defaultValue: 'pdf'
    },
    contenido: {
        type: DataTypes.TEXT, // URL or text content
        allowNull: true
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

Material.belongsTo(Unidad);
Unidad.hasMany(Material);

module.exports = Material;
