import { DataTypes } from 'sequelize';
import db from '../db/Conn.js';

const Users = db.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    photo_user: {
        type: DataTypes.STRING(100),
        defaultValue: 'default', // Corrigi o erro de 'defaultvalue' (estava minúsculo!)
    },
    victory: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    lose: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        // Sequelize já atualiza updatedAt automaticamente, mas o 'onUpdate' que você colocou não é suportado assim
    },
}, {
    tableName: 'users',
    timestamps: false,
});

export default Users;