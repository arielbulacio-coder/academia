const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./db');
const Curso = require('./models/Curso');
const Materia = require('./models/Materia');
const Alumno = require('./models/Alumno');

const app = express();
const port = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Cursos
app.get('/cursos', async (req, res) => {
    try {
        const cursos = await Curso.findAll();
        res.json(cursos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/cursos', async (req, res) => {
    try {
        const curso = await Curso.create(req.body);
        res.status(201).json(curso);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Materias
app.get('/materias', async (req, res) => {
    try {
        const materias = await Materia.findAll();
        res.json(materias);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/materias', async (req, res) => {
    try {
        const materia = await Materia.create(req.body);
        res.status(201).json(materia);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Alumnos
app.get('/alumnos', async (req, res) => {
    try {
        const alumnos = await Alumno.findAll();
        res.json(alumnos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ message: 'Courses Service is running', db_status: 'Connected' });
    } catch (error) {
        res.status(500).json({ message: 'Courses Service is running', db_status: 'Error', error: error.message });
    }
});

// Initialize DB and Start
sequelize.sync({ alter: true }).then(() => {
    console.log('Courses DB synced');
    app.listen(port, () => {
        console.log(`Courses Service listening at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to sync Courses DB:', err);
});
