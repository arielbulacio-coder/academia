const sequelize = require('./db');
const Curso = require('./models/Curso');
const Materia = require('./models/Materia');
const Alumno = require('./models/Alumno');

const seedData = async () => {
    await sequelize.sync({ force: true });

    // Cursos
    const cursos = await Curso.bulkCreate([
        { nombre: '1° Año', division: 'A', anio: 1, descripcion: 'Ciclo Básico' },
        { nombre: '2° Año', division: 'A', anio: 2, descripcion: 'Ciclo Básico' },
        { nombre: '3° Año', division: 'A', anio: 3, descripcion: 'Ciclo Básico' },
        { nombre: '4° Año', division: 'Informática', anio: 4, descripcion: 'Especialización' },
        { nombre: '5° Año', division: 'Informática', anio: 5, descripcion: 'Especialización' },
        { nombre: '6° Año', division: 'Informática	', anio: 6, descripcion: 'Práctica Profesional' },
        { nombre: '4° Año', division: 'Gastronomía', anio: 4, descripcion: 'Especialización' },
        { nombre: '5° Año', division: 'Gastronomía', anio: 5, descripcion: 'Especialización' },
    ]);

    // Materias
    const materias = await Materia.bulkCreate([
        { nombre: 'Matemática I', anio: 1, tipo: 'teoria' },
        { nombre: 'Prácticas del Lenguaje I', anio: 1, tipo: 'teoria' },
        { nombre: 'Inglés I', anio: 1, tipo: 'teoria' },
        { nombre: 'Ciencias Naturales', anio: 1, tipo: 'teoria' },
        { nombre: 'Construcción de Ciudadanía', anio: 1, tipo: 'teoria' },
        { nombre: 'Taller de Pre-informática', anio: 1, tipo: 'taller' },
        { nombre: 'Programación .NET', anio: 4, tipo: 'taller' },
        { nombre: 'Base de Datos I', anio: 4, tipo: 'taller' },
        { nombre: 'Sistemas Operativos', anio: 4, tipo: 'teoria' },
        { nombre: 'Cocina Básica', anio: 4, tipo: 'taller' },
        { nombre: 'Seguridad e Higiene', anio: 4, tipo: 'teoria' },
    ]);

    console.log('Courses seeded successfully');
};

seedData().then(() => process.exit()).catch(err => console.error(err));
