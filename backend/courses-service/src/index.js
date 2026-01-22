require('dotenv').config();
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
const Evaluacion = require('./models/Evaluacion');
const Pregunta = require('./models/Pregunta');
const Opcion = require('./models/Opcion');
const Calificacion = require('./models/Calificacion');

const app = express();
const port = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- ROUTES ---

// 1. Cursos Publicos / Generales
app.get('/cursos', async (req, res) => {
    try {
        const whereClause = {};
        if (req.query.EscuelaId) {
            whereClause.EscuelaId = req.query.EscuelaId;
        }
        if (req.query.profesorId) {
            whereClause.profesorId = req.query.profesorId;
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
                    include: [
                        Material,
                        Actividad,
                        {
                            model: Evaluacion,
                            include: [{
                                model: Pregunta,
                                include: [Opcion]
                            }]
                        }
                    ]
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

// 2. Unidades y Contenidos (Manual)
app.post('/unidades', async (req, res) => {
    try {
        const unidad = await Unidad.create(req.body);
        res.status(201).json(unidad);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2b. Inscripciones
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

// Eliminación
app.delete('/planificaciones/:id', async (req, res) => {
    try {
        await Planificacion.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Refinar con IA
app.post('/refinar', async (req, res) => {
    const { contenido, instruccion, apiKey } = req.body;
    const finalKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalKey) return res.status(400).json({ message: 'API Key requerida' });

    try {
        const genAI = new GoogleGenerativeAI(finalKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Actúa como un experto corrector pedagógico.
        Tu tarea es REESCRIBIR el siguiente contenido de una planificación, aplicando la siguiente instrucción: "${instruccion}".
        
        IMPORTANTE: Devuelve TODA la planificación revisada en formato Markdown. No cortes nada a menos que la instrucción lo pida.
        
        CONTENIDO A REVISAR:
        ${contenido}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ contenido: text });
    } catch (error) {
        console.error("Gemini Refine Error:", error);
        res.status(500).json({ message: 'Error refinando', detail: error.message });
    }
});

// 5. Planificador IA
app.post('/planificar', async (req, res) => {
    let { apiKey } = req.body;
    const { temario, horasTotales, horasSemanales, dias, fechaInicio, fechaFin, extras, archivoFormato, archivoDiseno, usarFormatoABP } = req.body;

    if (!apiKey) apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(400).json({ message: 'API Key requerida (configure GEMINI_API_KEY o envíela)' });

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let promptParts = [
            `Actúa como un experto docente de formación profesional.
            Genera una planificación anual detallada para el curso de: "${temario}".
            
            METODOLOGÍA PEDAGÓGICA (Aprendizaje Basado en Proyectos - ABP):
            1. EJE CENTRAL: Debes formular una PREGUNTA ORIENTADORA o SITUACIÓN PROBLEMÁTICA desafiante, vinculada al contexto real profesional, que guíe todo el curso.
            2. ESTRUCTURA: Organiza los contenidos y actividades en UNIDADES y MÓDULOS progresivos.
            3. RELACIÓN: Cada unidad debe aportar herramientas para resolver la problemática inicial.
            
            Datos Logísticos:
            - Docente a Cargo: ${req.body.profesorNombre || 'No especificado'}
            - Carga Horaria Total: ${horasTotales || 'No especificada'}
            - Carga Semanal: ${horasSemanales || 'No especificada'}
            - Días de Cursada: ${dias || 'No especificados'}
            - Ciclo Lectivo: Inicio ${fechaInicio || '2026'} - Fin ${fechaFin || '2026'}
            
            INSTRUCCIONES CRÍTICAS SOBRE DOCUMENTOS ADJUNTOS:
            1. Si se adjunta un "Diseño Curricular" (PDF de contenidos), DEBES USARLO como única fuente de verdad para los temas y contenidos. No inventes temas si están dados. Tu trabajo es adaptarlos a la estrategia ABP.
            2. Si se adjunta un "Archivo de Formato" (o se seleccionó formato institucional ABP), respeta esa estructura visual estrictamente.
            
            ${extras ? `Instrucciones adicionales del docente: ${extras}` : ''}
            
            El formato de salida debe ser Markdown limpio.`
        ];

        // Archivo 1: Formato (Local ABP o Subido)
        if (usarFormatoABP) {
            const fs = require('fs');
            const path = require('path');
            const abpPath = path.join(__dirname, '..', 'templates', 'Planificacion_ABP.pdf');
            if (fs.existsSync(abpPath)) {
                const abpData = fs.readFileSync(abpPath).toString('base64');
                promptParts.push("A CONTINUACIÓN EL FORMATO INSTITUCIONAL OBLIGATORIO (ABP):");
                promptParts.push({
                    inlineData: {
                        data: abpData,
                        mimeType: 'application/pdf'
                    }
                });
            } else {
                console.warn("Template ABP no encontrado en:", abpPath);
            }
        } else if (archivoFormato) {
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

// 6. GENERACIÓN AUTOMÁTICA DE AULA (AI)
app.post('/cursos/:id/generar-contenido', async (req, res) => {
    const { apiKey, planificacionTexto } = req.body;
    const finalKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalKey) return res.status(400).json({ message: 'API Key requerida' });

    try {
        const curso = await Curso.findByPk(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });

        const genAI = new GoogleGenerativeAI(finalKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Actúa como un diseñador instruccional experto y arquitecto de e-learning.
        Basado en la siguiente PLANIFICACIÓN del curso:
        
        "${planificacionTexto}"
        
        Tu tarea es generar la estructura COMPLETA del aula virtual para este curso en formato JSON.
        
        DEBES GENERAR:
        1. Unidades (Basadas en la planificación)
        2. Para cada Unidad:
           - Materiales de estudio: Propón videos (títulos y descripciones ficticias pero realistas, tipo 'Video Explicativo: ...'), artículos PDF (títulos), enlaces.
           - Actividades: Propón actividades de fijación y actividades profesionalizantes.
           - Evaluaciones: Crea un examen al final de la unidad con preguntas Multiple Choice.
        
        FORMATO JSON REQUERIDO:
        [
          {
            "titulo": "Título de la Unidad 1",
            "descripcion": "Descripción breve",
            "orden": 1,
            "materiales": [
              { "titulo": "Nombre del recurso", "tipo": "video|pdf|link", "contenido": "url_simulada_o_descripcion", "descripcion": "..." }
            ],
            "actividades": [
              { "titulo": "Nombre Actividad", "tipo": "entrega|formulario", "consigna": "Instrucciones..." }
            ],
            "evaluaciones": [
              {
                "titulo": "Examen Unidad 1",
                "preguntas": [
                  {
                    "enunciado": "¿Pregunta 1?",
                    "puntos": 10,
                    "opciones": [
                      { "texto": "Opción A", "esCorrecta": false },
                      { "texto": "Opción B", "esCorrecta": true }
                    ]
                  }
                ]
              }
            ]
          }
        ]
        
        IMPORTANTE: Devuelve SOLO el JSON válido, sin markdown ni explicaciones adicionales.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Limpiar markdown si existe
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const estructura = JSON.parse(text);

        // Guardar estructura en BD (Transaccional sería ideal, lo hacemos secuencial por simplicidad)
        for (const unidadData of estructura) {
            const unidad = await Unidad.create({
                titulo: unidadData.titulo,
                descripcion: unidadData.descripcion,
                orden: unidadData.orden || 0,
                CursoId: curso.id
            });

            // Materiales
            if (unidadData.materiales) {
                for (const mat of unidadData.materiales) {
                    await Material.create({ ...mat, UnidadId: unidad.id });
                }
            }

            // Actividades
            if (unidadData.actividades) {
                for (const act of unidadData.actividades) {
                    await Actividad.create({ ...act, UnidadId: unidad.id });
                }
            }

            // Evaluaciones
            if (unidadData.evaluaciones) {
                for (const evaData of unidadData.evaluaciones) {
                    const evaluacion = await Evaluacion.create({
                        titulo: evaData.titulo,
                        UnidadId: unidad.id
                    });

                    if (evaData.preguntas) {
                        for (const pregData of evaData.preguntas) {
                            const pregunta = await Pregunta.create({
                                enunciado: pregData.enunciado,
                                puntos: pregData.puntos || 1,
                                EvaluacionId: evaluacion.id
                            });

                            if (pregData.opciones) {
                                for (const opData of pregData.opciones) {
                                    await Opcion.create({ ...opData, PreguntaId: pregunta.id });
                                }
                            }
                        }
                    }
                }
            }
        }

        res.json({ message: 'Contenido generado exitosamente', estructura });

    } catch (error) {
        console.error("Error Generando Contenido:", error);
        res.status(500).json({ message: 'Error generando contenido', error: error.message });
    }
});

// 7. CALIFICACIÓN Y ENTREGA DE EXÁMENES
app.post('/evaluaciones/:id/entregar', async (req, res) => {
    // req.body: { alumnoId: 123, respuestas: { "preguntaId_1": "opcionId_A", "preguntaId_2": "opcionId_C" } }
    const { alumnoId, respuestas } = req.body;

    try {
        const evaluacion = await Evaluacion.findByPk(req.params.id, {
            include: [{
                model: Pregunta,
                include: [Opcion]
            }]
        });

        if (!evaluacion) return res.status(404).json({ message: 'Evaluación no encontrada' });

        let puntajeTotal = 0;
        let puntajeObtenido = 0;
        let detalleCorreccion = [];

        for (const pregunta of evaluacion.Pregunta) {
            puntajeTotal += pregunta.puntos;

            const opcionElegidaId = respuestas[pregunta.id];
            // Buscar la opción correcta
            const opcionCorrecta = pregunta.Opcions.find(o => o.esCorrecta);
            const opcionElegida = pregunta.Opcions.find(o => o.id == opcionElegidaId);

            const esCorrecta = opcionElegida && opcionElegida.esCorrecta;

            if (esCorrecta) {
                puntajeObtenido += pregunta.puntos;
            }

            detalleCorreccion.push({
                preguntaId: pregunta.id,
                esCorrecta,
                opcionCorrectaId: opcionCorrecta ? opcionCorrecta.id : null,
                opcionElegidaId
            });
        }

        const notaFinal = puntajeTotal > 0 ? (puntajeObtenido / puntajeTotal) * 100 : 0;

        // Guardar Nota
        const calificacion = await Calificacion.create({
            AlumnoId: alumnoId,
            EvaluacionId: evaluacion.id,
            nota: notaFinal,
            detalles: detalleCorreccion
        });

        res.json({
            nota: notaFinal,
            puntajeObtenido,
            puntajeTotal,
            detalle: detalleCorreccion
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/calificaciones/alumno/:id', async (req, res) => {
    try {
        const notas = await Calificacion.findAll({
            where: { AlumnoId: req.params.id },
            include: [Evaluacion]
        });
        res.json(notas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. IMPORTAR AULA (CLONAR)
app.post('/cursos/:id/importar', async (req, res) => {
    const { cursoOrigenId } = req.body; // ID del curso desde donde copiamos
    const cursoDestinoId = req.params.id;

    try {
        const cursoOrigen = await Curso.findByPk(cursoOrigenId, {
            include: [{
                model: Unidad,
                include: [
                    Material,
                    Actividad,
                    {
                        model: Evaluacion,
                        include: [{ model: Pregunta, include: [Opcion] }]
                    }
                ]
            }]
        });

        if (!cursoOrigen) return res.status(404).json({ message: 'Curso origen no encontrado' });

        // Clonar estructura
        for (const unidadOrigen of cursoOrigen.Unidads) {
            const unidadNueva = await Unidad.create({
                titulo: unidadOrigen.titulo,
                descripcion: unidadOrigen.descripcion,
                orden: unidadOrigen.orden,
                CursoId: cursoDestinoId
            });

            // Clonar Materiales
            for (const mat of unidadOrigen.Materials) {
                await Material.create({
                    titulo: mat.titulo,
                    tipo: mat.tipo,
                    contenido: mat.contenido,
                    descripcion: mat.descripcion,
                    UnidadId: unidadNueva.id
                });
            }

            // Clonar Actividades
            for (const act of unidadOrigen.Actividads) {
                await Actividad.create({
                    titulo: act.titulo,
                    tipo: act.tipo,
                    consigna: act.consigna,
                    UnidadId: unidadNueva.id
                });
            }

            // Clonar Evaluaciones
            for (const eva of unidadOrigen.Evaluacions) {
                const evaNueva = await Evaluacion.create({
                    titulo: eva.titulo,
                    descripcion: eva.descripcion,
                    UnidadId: unidadNueva.id
                });

                for (const preg of eva.Pregunta) {
                    const pregNueva = await Pregunta.create({
                        enunciado: preg.enunciado,
                        puntos: preg.puntos,
                        EvaluacionId: evaNueva.id
                    });

                    for (const op of preg.Opcions) {
                        await Opcion.create({
                            texto: op.texto,
                            esCorrecta: op.esCorrecta,
                            PreguntaId: pregNueva.id
                        });
                    }
                }
            }
        }

        res.json({ message: 'Contenido importado exitosamente' });

    } catch (error) {
        console.error("Error importando:", error);
        res.status(500).json({ error: error.message });
    }
});



// 7. GENERACION DE MATERIAL DIDACTICO PDF + EVALUACION (AI)
app.post('/cursos/:cursoId/unidades/:unidadId/generar-material-pdf', async (req, res) => {
    const { cursoId, unidadId } = req.params;
    const {
        topic,
        pages,
        includeMultipleChoice,
        includeFinalExam,
        apiKey
    } = req.body;

    const finalKey = apiKey || process.env.GEMINI_API_KEY;
    if (!finalKey) return res.status(400).json({ message: 'API Key requerida' });

    try {
        const unidad = await Unidad.findOne({ where: { id: unidadId, CursoId: cursoId } });
        if (!unidad) return res.status(404).json({ message: 'Unidad no encontrada' });

        const genAI = new GoogleGenerativeAI(finalKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Actúa como un experto docente y creador de contenido educativo.
        Tu tarea es generar un Material Didáctico y (opcionalmente) Evaluaciones para un curso de formación profesional.
        Tema del Material: "${topic}"
        Longitud aproximada: ${pages} páginas de contenido (aprox 400 palabras por página).

        REQUISITOS DEL MATERIAL:
        1. Utiliza fuentes de información reconocidas, técnicas y verificables.
        2. El tono debe ser formal, educativo y técnico.
        3. Estructura el contenido con: Título, Introducción, Desarrollo (Subtítulos claros) y Conclusión.
        
        ${includeMultipleChoice ? `
        REQUISITOS EVALUACIÓN PARCIAL (Multiple Choice):
        - 5 Preguntas sobre el texto generado.
        - 4 opciones por pregunta, 1 correcta.
        ` : ''}

        ${includeFinalExam ? `
        REQUISITOS EVALUACIÓN FINAL (Examen):
        - 10 Preguntas exhaustivas sobre el tema.
        - 4 opciones por pregunta, 1 correcta.
        ` : ''}

        FORMATO DE SALIDA (JSON PURO):
        Devuelve SOLO un objeto JSON con esta estructura exacta sin markdown fences:
        {
            "titulo": "Título Sugerido",
            "contenido": "Texto completo del material... (usa saltos de línea \\n para párrafos)",
            "evaluacionParcial": [
                { "enunciado": "...", "opciones": [{"texto": "...", "esCorrecta": true/false}, ...] }
            ],
            "evaluacionFinal": [
                { "enunciado": "...", "opciones": [{"texto": "...", "esCorrecta": true/false}, ...] }
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let data;
        try {
            data = JSON.parse(jsonStr);
        } catch (e) {
            console.error("AI JSON Parse Error", text);
            return res.status(500).json({ message: 'Error procesando respuesta de IA', raw: text });
        }

        // Generate PDF
        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));

        doc.fontSize(20).text(data.titulo, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(data.contenido, { align: 'justify', columns: 1 });
        doc.end();

        const pdfBuffer = await new Promise(resolve => {
            doc.on('end', () => resolve(Buffer.concat(buffers)));
        });

        const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

        const material = await Material.create({
            titulo: data.titulo,
            tipo: 'pdf',
            contenido: pdfBase64,
            descripcion: `Material generado por IA sobre: ${topic}. ${pages} páginas.`,
            UnidadId: unidad.id
        });

        let evals = [];
        if (data.evaluacionParcial && data.evaluacionParcial.length > 0) {
            const eva = await Evaluacion.create({
                titulo: `Evaluación Parcial: ${data.titulo}`,
                descripcion: 'Autogenerada por IA',
                UnidadId: unidad.id
            });
            evals.push(eva);
            for (const p of data.evaluacionParcial) {
                const preg = await Pregunta.create({ enunciado: p.enunciado, EvaluacionId: eva.id });
                for (const o of p.opciones) {
                    await Opcion.create({ texto: o.texto, esCorrecta: o.esCorrecta, PreguntaId: preg.id });
                }
            }
        }

        if (data.evaluacionFinal && data.evaluacionFinal.length > 0) {
            const eva = await Evaluacion.create({
                titulo: `Examen Final: ${data.titulo}`,
                descripcion: 'Autogenerada por IA',
                UnidadId: unidad.id
            });
            evals.push(eva);
            for (const p of data.evaluacionFinal) {
                const preg = await Pregunta.create({ enunciado: p.enunciado, EvaluacionId: eva.id });
                for (const o of p.opciones) {
                    await Opcion.create({ texto: o.texto, esCorrecta: o.esCorrecta, PreguntaId: preg.id });
                }
            }
        }

        res.json({ message: 'Material generado correctamente', material, evaluations: evals });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 8. CALIFICAR EVALUACION (Auto-corrección)
app.post('/evaluaciones/:id/entregar', async (req, res) => {
    const { respuestas, alumnoId } = req.body;
    try {
        const evaluacion = await Evaluacion.findByPk(req.params.id, {
            include: [{ model: Pregunta, include: [Opcion] }]
        });
        if (!evaluacion) return res.status(404).json({ message: 'Evaluación no encontrada' });

        let correctas = 0;
        let total = evaluacion.Pregunta.length;
        let detalles = [];

        evaluacion.Pregunta.forEach(preg => {
            const selectedOptionId = respuestas[preg.id];
            const correctOption = preg.Opcions.find(o => o.esCorrecta);

            const isCorrect = correctOption && (String(correctOption.id) === String(selectedOptionId));
            if (isCorrect) correctas++;

            detalles.push({
                preguntaId: preg.id,
                correcta: isCorrect
            });
        });

        const nota = total > 0 ? (correctas / total) * 100 : 0;

        const calificacion = await Calificacion.create({
            AlumnoId: alumnoId || 1,
            EvaluacionId: evaluacion.id,
            nota: Math.round(nota),
            detalles: detalles
        });

        res.json({ nota: Math.round(nota), calificacion });

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
