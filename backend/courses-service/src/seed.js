const sequelize = require('./db');
const Curso = require('./models/Curso');
const Unidad = require('./models/Unidad');
const Material = require('./models/Material');
const Actividad = require('./models/Actividad');
const Inscripcion = require('./models/Inscripcion');

const seedData = async () => {
    await sequelize.sync({ force: true });

    // 1. Curso: Aplicaciones de Electrónica Digital
    const cursoDigital = await Curso.create({
        nombre: 'Aplicaciones de Electrónica Digital',
        descripcion: 'Curso avanzado de electrónica digital, microcontroladores y sistemas embebidos. Instructor: Ariel Bulacio',
        imagen: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    });

    const unidad1 = await Unidad.create({
        titulo: 'Unidad 1: Fundamentos',
        descripcion: 'Repaso de lógica digital',
        orden: 1,
        CursoId: cursoDigital.id
    });

    const unidad2 = await Unidad.create({
        titulo: 'Unidad 2: Arduino y Microcontroladores',
        descripcion: 'Programación en C++',
        orden: 2,
        CursoId: cursoDigital.id
    });

    await Material.create({
        titulo: 'DataSheet Atmega328',
        tipo: 'pdf',
        UnidadId: unidad1.id
    });

    await Actividad.create({
        titulo: 'TP 1: Semáforo Inteligente',
        tipo: 'entrega',
        fechaEntrega: new Date('2026-05-20'),
        UnidadId: unidad2.id
    });

    // Validar Inscripción de Alumno (alumno@academia.com)
    await Inscripcion.create({
        alumnoEmail: 'alumno@academia.com',
        CursoId: cursoDigital.id,
        calificacionFinal: 8.5
    });

    // 2. Otros Cursos
    await Curso.create({
        nombre: 'Manipulación de Alimentos',
        descripcion: 'Normas de higiene y seguridad para el manejo de alimentos.',
        imagen: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    });

    await Curso.create({
        nombre: 'Maestro Pizzero Rotisero',
        descripcion: 'Técnicas profesionales para pizzas y rotisería.',
        imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    });

    console.log('Courses seeded successfully with new structure!');
};

seedData().then(() => process.exit()).catch(err => console.error(err));
