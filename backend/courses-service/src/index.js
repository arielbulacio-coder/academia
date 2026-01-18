const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./db');
const Curso = require('./models/Curso');
const Unidad = require('./models/Unidad');
const Material = require('./models/Material');
const Actividad = require('./models/Actividad');
const Inscripcion = require('./models/Inscripcion');
const ObservacionClase = require('./models/ObservacionClase');

const app = express();
const port = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Cursos Publicos / Generales
app.get('/cursos', async (req, res) => {
    try {
        // En un futuro, filtrar por req.query.EscuelaId si se pasa
        const whereClause = {};
        if (req.query.EscuelaId) {
            whereClause.EscuelaId = req.query.EscuelaId;
        }

        const cursos = await Curso.findAll({
            where: whereClause,
            include: [{
                model: Unidad,
                include: [Material, Actividad]
            }],
            order: [
                ['nombre', 'ASC'],
                [Unidad, 'orden', 'ASC']
            ]
        });
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

app.get('/cursos/:id', async (req, res) => {
    try {
        const curso = await Curso.findByPk(req.params.id, {
            include: [
                {
                    model: Unidad,
                    include: [Material, Actividad]
                },
                {
                    model: Inscripcion
                }
            ],
            order: [[Unidad, 'orden', 'ASC']]
        });
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
        res.json(curso);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/cursos/:id', async (req, res) => {
    try {
        await Curso.update(req.body, {
            where: { id: req.params.id }
        });
        res.json({ message: 'Curso actualizado' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/cursos/:id', async (req, res) => {
    try {
        await Curso.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Curso eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Inscripciones
app.post('/inscripciones', async (req, res) => {
    try {
        const inscripcion = await Inscripcion.create(req.body);
        res.status(201).json(inscripcion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/inscripciones/alumno', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email requerido' });

        const inscripciones = await Inscripcion.findAll({
            where: { alumnoEmail: email },
            include: [Curso]
        });
        res.json(inscripciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Observaciones
app.post('/observaciones', async (req, res) => {
    try {
        const obs = await ObservacionClase.create(req.body);
        res.status(201).json(obs);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/observaciones', async (req, res) => {
    try {
        const whereClause = {};
        if (req.query.EscuelaId) {
            whereClause.EscuelaId = req.query.EscuelaId;
        }
        const obs = await ObservacionClase.findAll({ where: whereClause, order: [['fecha', 'DESC']] });
        res.json(obs);
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
