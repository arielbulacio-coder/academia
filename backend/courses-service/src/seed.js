const sequelize = require('./db');
const Curso = require('./models/Curso');
const Unidad = require('./models/Unidad');
const Material = require('./models/Material');
const Actividad = require('./models/Actividad');
const Inscripcion = require('./models/Inscripcion');
const ObservacionClase = require('./models/ObservacionClase');

const seedData = async () => {
    await sequelize.sync({ force: true });

    console.log('--- Seeding Academia Multi-School ---');

    // Suponemos ID 1 para la Escuela Técnica creada en Auth Service (esto alinea IDs)
    const ESCUELA_ID = 1;

    // 1. Curso: Electrónica
    const cursoElectro = await Curso.create({
        nombre: 'Aplicaciones de Electrónica Digital',
        descripcion: 'Microcontroladores PIC, Arduino y diseño de PCBs.',
        imagen: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?q=80&w=1000',
        EscuelaId: ESCUELA_ID
    });

    // 2. Curso: Gastronomía
    const cursoPizzero = await Curso.create({
        nombre: 'Maestro Pizzero Profesional',
        descripcion: 'Especialización en masas fermentadas y hornos de barro.',
        imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000',
        EscuelaId: ESCUELA_ID
    });

    const unidad1 = await Unidad.create({ titulo: 'Unidad 1: Arduino Básico', orden: 1, CursoId: cursoElectro.id });
    await Material.create({ titulo: 'Manual Inicial', tipo: 'pdf', UnidadId: unidad1.id });

    // Alumno inscripto
    await Inscripcion.create({ alumnoEmail: 'alumno@academia.com', CursoId: cursoElectro.id });

    // Observación de Prueba
    await ObservacionClase.create({
        directorEmail: 'director@academia.com',
        profesorNombre: 'Ariel Bulacio',
        materiaValidada: 'Electrónica Digital',
        EscuelaId: ESCUELA_ID,
        itemsEvaluacion: { puntualidad: 5, planificacion: 4, dominio_grupo: 5 },
        comentarios: 'Excelente clase, muy práctica.'
    });

    console.log('Courses seeded ready for Multi-School!');
};

seedData().then(() => process.exit()).catch(err => console.error(err));
