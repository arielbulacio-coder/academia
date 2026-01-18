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
const Planificacion = require('./models/Planificacion');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Cursos Publicos / Generales
app.get('/cursos', async (req, res) => {
    try {
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
        const { EscuelaId, role, email } = req.query;
        let whereClause = {};

        // Inspector ve TODO. Admin también.
        if (role === 'inspector' || role === 'admin') {
            // Puede filtrar si quiere
            if (EscuelaId) whereClause.EscuelaId = EscuelaId;
        }
        // Directivos solo SU escuela
        else if (['director', 'vicedirector', 'regente'].includes(role)) {
            // El front debe enviar su EscuelaId, pero por seguridad, el backend de auth
            // debería inyectarlo. Aquí confiamos en el queryparam validado por el front o 
            // idealmente extraído del token en middleware (pero este microservicio confía en el gateway/front por ahora).
            if (EscuelaId) whereClause.EscuelaId = EscuelaId;
        }
        else {
            // Profesores solo ven las suyas (por nombre p.ej o no ven nada)
            // Por ahora restringido.
            // whereClause.profesorNombre = ...
        }

        const obs = await ObservacionClase.findAll({ where: whereClause, order: [['fecha', 'DESC']] });
        res.json(obs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. PLANIFICACIONES (Persistencia y Revisión)
app.post('/planificaciones', async (req, res) => {
    try {
        const plan = await Planificacion.create(req.body);
        res.status(201).json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/planificaciones', async (req, res) => {
    try {
        const { EscuelaId, email, role } = req.query;
        let whereClause = {};

        // Si es directivo, ve todo de su escuela. Si es profesor, solo las suyas.
        if (['director', 'vicedirector', 'regente'].includes(role)) {
            if (EscuelaId) whereClause.EscuelaId = EscuelaId;
        } else {
            // Profesor normal
            if (email) whereClause.profesorEmail = email;
        }

        const planes = await Planificacion.findAll({
            where: whereClause,
            order: [['updatedAt', 'DESC']]
        });
        res.json(planes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/planificaciones/:id', async (req, res) => {
    try {
        const plan = await Planificacion.findByPk(req.params.id);
        if (!plan) return res.status(404).json({ message: 'No encontrada' });
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/planificaciones/:id', async (req, res) => {
    try {
        // Puede actualizar contenido O agregar comentario
        const plan = await Planificacion.findByPk(req.params.id);
        if (!plan) return res.status(404).json({ message: 'No existe' });

        if (req.body.nuevoComentario) {
            // Agregar comentario
            const comments = plan.comentarios || [];
            comments.push(req.body.nuevoComentario); // { autor, texto, fecha }
            await plan.update({ comentarios: comments, estado: 'revision' }); // Cambia estado al comentar
        } else {
            // Edición normal del docente
            await plan.update(req.body);
        }

        res.json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 5. Planificador IA
app.post('/planificar', async (req, res) => {
    const { apiKey, temario, horasTotales, horasSemanales, dias, fechaInicio, fechaFin, extras, archivoFormato, archivoDiseno } = req.body;

    if (!apiKey) return res.status(400).json({ message: 'API Key requerida' });

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let promptParts = [
            `Actúa como un experto docente de formación profesional.
            Genera una planificación anual detallada para el curso de: "${temario}".
            
            Datos Logísticos:
            - Carga Horaria Total: ${horasTotales || 'No especificada'}
            - Carga Semanal: ${horasSemanales || 'No especificada'}
            - Días de Cursada: ${dias || 'No especificados'}
            - Ciclo Lectivo: Inicio ${fechaInicio || '2026'} - Fin ${fechaFin || '2026'}
            
            INSTRUCCIONES CRÍTICAS SOBRE DOCUMENTOS ADJUNTOS:
            1. Si se adjunta un "Archivo de Formato", DEBES seguir estrictamente esa estructura visual y jerárquica para tu respuesta.
            2. Si se adjunta un "Diseño Curricular", DEBES extraer los contenidos, objetivos y unidades de ESE documento y usarlos para llenar la planificación.
            
            ${extras ? `Instrucciones adicionales: ${extras}` : ''}
            
            El formato de salida debe ser Markdown limpio.`
        ];

        // Archivo 1: Formato
        if (archivoFormato) {
            promptParts.push("A CONTINUACIÓN EL ARCHIVO DE FORMATO/PLANTILLA:");
            promptParts.push({
                inlineData: {
                    data: archivoFormato.data,
                    mimeType: archivoFormato.mimeType || 'application/pdf'
                }
            });
        }

        // Archivo 2: Diseño
        if (archivoDiseno) {
            promptParts.push("A CONTINUACIÓN EL DISEÑO CURRICULAR (CONTENIDOS):");
            promptParts.push({
                inlineData: {
                    data: archivoDiseno.data,
                    mimeType: archivoDiseno.mimeType || 'application/pdf'
                }
            });
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        res.json({ planificacion: text });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ message: 'Error generando planificación', detail: error.message });
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
