const sequelize = require('./db');
const Curso = require('./models/Curso');
const Materia = require('./models/Materia');
const Unidad = require('./models/Unidad');
const Material = require('./models/Material');
const Actividad = require('./models/Actividad');

const seedData = async () => {
    await sequelize.sync({ force: true });

    // 1. Curso Principal
    const cursoDigital = await Curso.create({
        nombre: 'Aplicaciones de Electrónica Digital',
        division: 'A',
        anio: 6,
        descripcion: 'Curso avanzado de electrónica digital y microcontroladores. Profesor: Ariel Bulacio'
    });

    // Otros cursos de relleno
    await Curso.bulkCreate([
        { nombre: '1° Año', division: 'A', anio: 1, descripcion: 'Ciclo Básico' },
        { nombre: '2° Año', division: 'A', anio: 2, descripcion: 'Ciclo Básico' },
        { nombre: '3° Año', division: 'A', anio: 3, descripcion: 'Ciclo Básico' },
        { nombre: '4° Año', division: 'Informática', anio: 4, descripcion: 'Especialización' },
    ]);

    // 2. Unidades del Curso Digital
    const unidad1 = await Unidad.create({
        titulo: 'Unidad 1: Fundamentos de Lógica Digital',
        descripcion: 'Repaso de compuertas lógicas y álgebra de Boole.',
        orden: 1,
        CursoId: cursoDigital.id
    });

    const unidad2 = await Unidad.create({
        titulo: 'Unidad 2: Microcontroladores',
        descripcion: 'Arquitectura de microcontroladores y programación básica.',
        orden: 2,
        CursoId: cursoDigital.id
    });

    // 3. Materiales
    await Material.bulkCreate([
        {
            titulo: 'Guía de Compuertas Lógicas',
            tipo: 'pdf',
            contenido: 'https://example.com/guia-logica.pdf',
            descripcion: 'Documento PDF con la teoría básica.',
            UnidadId: unidad1.id
        },
        {
            titulo: 'Video Introductorio',
            tipo: 'video',
            contenido: 'https://youtube.com/watch?v=example',
            descripcion: 'Clase grabada sobre álgebra de Boole.',
            UnidadId: unidad1.id
        },
        {
            titulo: 'Datasheet ATMega328p',
            tipo: 'pdf',
            contenido: 'https://example.com/datasheet.pdf',
            UnidadId: unidad2.id
        }
    ]);

    // 4. Actividades
    await Actividad.bulkCreate([
        {
            titulo: 'TP N°1: Simplificación de Funciones',
            tipo: 'entrega',
            consigna: 'Resolver los ejercicios de la página 10 a 15 de la guía y subir el PDF.',
            fechaEntrega: new Date('2026-03-15'),
            UnidadId: unidad1.id
        },
        {
            titulo: 'Cuestionario de Arquitectura',
            tipo: 'formulario',
            consigna: 'Responder las preguntas sobre arquitectura Harvard vs Von Neumann.',
            UnidadId: unidad2.id
        }
    ]);

    // Materias Base
    await Materia.bulkCreate([
        { nombre: 'Matemática', anio: 6, tipo: 'teoria' },
        { nombre: 'Electrónica Aplicada', anio: 6, tipo: 'taller' },
    ]);

    console.log('Courses seeded successfully with full structure!');
};

seedData().then(() => process.exit()).catch(err => console.error(err));
