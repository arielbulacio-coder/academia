require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sequelize = require('./db');
const User = require('./models/User');
const Escuela = require('./models/Escuela');

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token missing' });
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---

app.post('/auth/register', async (req, res) => {
    // Registro público (solo alumnos por defecto)
    try {
        const { name, email, password, role, EscuelaId } = req.body;
        // Solo permitir roles básicos o filtrar si es público
        // Para simplificar, permitimos registro, pero en prod deberiamos limitar
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword,
            role: role || 'alumno',
            EscuelaId
        });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, EscuelaId: user.EscuelaId }, process.env.JWT_SECRET || 'secret');
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, EscuelaId: user.EscuelaId } });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, EscuelaId: user.EscuelaId }, process.env.JWT_SECRET || 'secret');
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, EscuelaId: user.EscuelaId, photo: user.photo } });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
});

// --- MANAGEMENT ROUTES (Users & Schools) ---

// Crear Usuarios (Gestionado por Admin/Director/Secretario)
app.post('/users', authMiddleware, async (req, res) => {
    try {
        const { name, email, password, role, EscuelaId, photo } = req.body;
        const requester = req.user;

        // Validaciones de permisos simples
        if (requester.role === 'admin') {
            // Admin puede crear cualquier cosa, incluyendo directores y escuelas
        } else if (requester.role === 'director' || requester.role === 'secretario') {
            // Solo pueden crear en SU escuela
            if (EscuelaId && parseInt(EscuelaId) !== requester.EscuelaId) {
                return res.status(403).json({ message: 'No puedes crear usuarios en otra escuela' });
            }
            // Forzar escuela del creador si no se envía
            req.body.EscuelaId = requester.EscuelaId;
        } else {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || '123456', salt); // Default pass

        const newUser = await User.create({
            name, email, password: hashedPassword, role,
            EscuelaId: req.body.EscuelaId || EscuelaId,
            photo
        });

        res.status(201).json(newUser);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

app.get('/users', authMiddleware, async (req, res) => {
    try {
        const requester = req.user;
        let whereClause = {};

        if (requester.role === 'admin') {
            // Admin ve todo, o filtra por escuela si quiere
            if (req.query.EscuelaId) whereClause.EscuelaId = req.query.EscuelaId;
        } else {
            // Director/Secretario solo ve su escuela
            whereClause.EscuelaId = requester.EscuelaId;
        }

        if (req.query.role) whereClause.role = req.query.role;

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            include: [Escuela]
        });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/users/:id', authMiddleware, async (req, res) => {
    // TODO: Agregar validación de que solo borres gente de tu escuela
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
});

// Escuelas (Solo Admin)
app.post('/escuelas', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const escuela = await Escuela.create(req.body);
    res.status(201).json(escuela);
});

app.get('/escuelas', async (req, res) => {
    const escuelas = await Escuela.findAll();
    res.json(escuelas);
});

// Health check
app.get('/', async (req, res) => {
    await sequelize.authenticate();
    res.json({ message: 'Auth Service Ready' });
});

sequelize.sync({ alter: true }).then(() => {
    app.listen(port, () => console.log(`Auth Service at ${port}`));
});
