const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Escuela = require('./Escuela');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'inspector', 'director', 'vicedirector', 'regente', 'secretario', 'profesor', 'alumno', 'padre', 'preceptor', 'jefe_preceptores'),
        defaultValue: 'alumno'
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    interests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    EscuelaId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

User.belongsTo(Escuela);
Escuela.hasMany(User);

module.exports = User;
